import { useEffect, useMemo, useState } from "react";
import {
  buildProgramTermAlignment,
  getTermRules,
} from "./services/decisionEngine";
import { parseSyllabusWithGemini } from "./services/geminiService";
import { inferProgramTermFromParsedSyllabus } from "./utils/termInference";
import { formatCourseCode } from "./utils/text";
import { generateCodebaseDocumentationPdf } from "./utils/pdfGenerator";
import { ProcessingModal } from "./components/ProcessingModal";
import { ClassmateAssignmentModal } from "./components/ClassmateAssignmentModal";
import { CreatedAssignmentsPanel } from "./components/CreatedAssignmentsPanel";
import { LucideSparkles, LucideCheckCircle2, LucideBookOpen, LucideLightbulb, LucideMoon, LucideSun } from "lucide-react";
import type {
  ClassmateAssignment,
  ProgramTerm,
  ProgramTermAssignment,
  ProgramTermAlignment,
  SimRecommendationResult,
  UploadedSyllabus,
} from "./types";

type LocalUploadedSyllabus = UploadedSyllabus & {
  file?: File;
};


const programTerms: ProgramTerm[] = ["Term 1", "Term 2", "Term 3", "Term 4", "Term 5"];
const programOverview: Record<
  ProgramTerm,
  {
    phase: string;
    courses: string;
    cognitiveFocus: string[];
    simDifficulty: string;
    bloomLevel: string;
    selectionDifficulty: string;
    recommendedOptions: string;
  }
> = {
  "Term 1": {
    phase: "Foundation",
    courses: "Program term 1 courses",
    cognitiveFocus: ["Assessment basics", "Oxygen & meds", "Guided decisions"],
    simDifficulty: "Basic",
    bloomLevel: "Remember -> Apply",
    selectionDifficulty: "Basic",
    recommendedOptions: "Al K. Seltzer, George Jayson, Joe Blow, Flo Mieter, Mr. R.T. Fuller, Oxygen Rounds",
  },
  "Term 2": {
    phase: "Structured Application",
    courses: "Program term 2 courses",
    cognitiveFocus: ["Pathophysiology links", "ABG/CXR/ECG intro", "Prioritization begins"],
    simDifficulty: "Basic-Intermediate",
    bloomLevel: "Apply -> Analyze",
    selectionDifficulty: "Basic -> Intermediate",
    recommendedOptions: "Inowana Newby, Will Williams, Hy Ball, Patty Mitrail, intermediate bridge cases",
  },
  "Term 3": {
    phase: "Clinical Application",
    courses: "Program term 3 courses",
    cognitiveFocus: ["Mechanical ventilation", "ABG-driven decisions", "Alarm troubleshooting"],
    simDifficulty: "Intermediate",
    bloomLevel: "Analyze",
    selectionDifficulty: "Intermediate",
    recommendedOptions: "Intermediate ventilator and ABG-driven cases, with faculty-approved advanced bridge cases",
  },
  "Term 4": {
    phase: "Integrated Critical Thinking",
    courses: "Program term 4 courses",
    cognitiveFocus: ["ICU integration", "Hemodynamics", "Neonatal/Peds adaptation"],
    simDifficulty: "Advanced",
    bloomLevel: "Analyze -> Evaluate",
    selectionDifficulty: "Advanced",
    recommendedOptions: "Baby Adams, Baby Baxter, Baby Collins, Baby Greene, advanced ICU/neonatal/pediatric cases",
  },
  "Term 5": {
    phase: "NBRC-Level Reasoning",
    courses: "Program term 5 courses",
    cognitiveFocus: ["Diagnostics mastery", "CPG/TDP application", "Terminate/Modify/Continue decisions"],
    simDifficulty: "NBRC-Level",
    bloomLevel: "Evaluate",
    selectionDifficulty: "NBRC-Level",
    recommendedOptions: "Problem 14-22 advanced set, mixed CSE-style sequencing, end-of-program readiness cases",
  },
};

function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("classmatelr-theme");
    return savedTheme
      ? savedTheme === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  const [syllabi, setSyllabi] = useState<LocalUploadedSyllabus[]>([]);
  const [pastedText, setPastedText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisTotal, setAnalysisTotal] = useState(0);
  const [message, setMessage] = useState("");
  const [createdAssignments, setCreatedAssignments] = useState<ClassmateAssignment[]>([]);
  const [assignmentModalData, setAssignmentModalData] = useState<{
    isOpen: boolean;
    recommendation: SimRecommendationResult | null;
    selectedSim?: SimRecommendationResult["recommendedSims"][number] | null;
    courseCode?: string;
    syllabusTitle?: string;
  }>({
    isOpen: false,
    recommendation: null,
  });

  const programMap = useMemo<ProgramTermAlignment[]>(
    () => buildProgramTermAlignment(syllabi.filter(s => s.parsingStatus !== "pending")),
    [syllabi],
  );
  const isReportReady =
    syllabi.some((syllabus) => syllabus.parsingStatus === "parsed") &&
    syllabi.every((syllabus) => !["pending", "parsing"].includes(syllabus.parsingStatus));

  useEffect(() => {
    document.documentElement.dataset.theme = isDarkMode ? "dark" : "light";
    localStorage.setItem("classmatelr-theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  const currentParsingSyllabus = useMemo(() => {
    return syllabi.find((s) => s.parsingStatus === "parsing") || syllabi[analysisProgress] || null;
  }, [syllabi, analysisProgress]);

  const handleOpenAssignmentModal = (
    recommendation: SimRecommendationResult,
    selectedSim?: SimRecommendationResult["recommendedSims"][number] | null,
    courseCode?: string,
    syllabusTitle?: string,
  ) => {
    setAssignmentModalData({
      isOpen: true,
      recommendation,
      selectedSim,
      courseCode,
      syllabusTitle,
    });
  };

  const handleSaveAssignment = (newAssignment: ClassmateAssignment) => {
    setCreatedAssignments((prev) => [newAssignment, ...prev]);
    setMessage(`Classmate assignment "${newAssignment.title}" published!`);
  };

  const handleDeleteAssignment = (id: string) => {
    setCreatedAssignments((prev) => prev.filter((a) => a.id !== id));
  };


  function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    const newSyllabi: LocalUploadedSyllabus[] = Array.from(files).map((file) => {
      const id = crypto.randomUUID();
      return {
      id,
      sourceDocumentId: id,
      sourceFileName: file.name,
      fileName: file.name,
      file,
      assignedProgramTerm: inferProgramTerm(file.name),
      parsedModules: [],
      parsingStatus: "pending",
    }});
    setSyllabi((current) => [...current, ...newSyllabi]);
    setMessage("Files added. Assign each syllabus to a program term, then analyze.");
  }

  function addPastedSyllabus() {
    if (!pastedText.trim()) return;
    setSyllabi((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        fileName: `Pasted syllabus ${current.filter((item) => item.rawText).length + 1}`,
        rawText: pastedText,
        assignedProgramTerm: inferProgramTerm(pastedText),
        parsedModules: [],
        parsingStatus: "pending",
      },
    ]);
    setPastedText("");
    setMessage("Pasted syllabus added. Assign it to a program term, then analyze.");
  }

  function updateTerm(id: string, assignedProgramTerm: ProgramTermAssignment) {
    setSyllabi((current) =>
      current.map((syllabus) =>
        syllabus.id === id ? { ...syllabus, assignedProgramTerm, termAssignmentSource: "manual_override", termAssignmentConfidence: "high", termAssignmentReason: "Faculty manually adjusted the program term." } : syllabus,
      ),
    );
  }

  function removeSyllabus(id: string) {
    setSyllabi((current) => current.filter((syllabus) => syllabus.id !== id));
  }

  async function analyzeSyllabus(target: LocalUploadedSyllabus): Promise<LocalUploadedSyllabus> {
    if (target.parsingStatus === "parsed" && target.parsedModules && target.parsedModules.length > 0) {
      return target;
    }

    setSyllabi((current) =>
      current.map((syllabus) =>
        syllabus.id === target.id ? { ...syllabus, parsingStatus: "parsing" } : syllabus,
      ),
    );

    const response = await parseSyllabusWithGemini(target.rawText ?? "", target.file ?? null);
    
    let assignedTerm = target.assignedProgramTerm;
    let termAssignmentSource = target.termAssignmentSource;
    let termAssignmentConfidence = target.termAssignmentConfidence;
    let termAssignmentReason = target.termAssignmentReason;
    
    if (response.parsed && response.parsed.modules && response.parsed.modules.length > 0 && target.termAssignmentSource !== "manual_override") {
      const inference = inferProgramTermFromParsedSyllabus(response.parsed.modules, target.fileName, response.parsed.courseCode);
      assignedTerm = inference.term;
      termAssignmentSource = inference.source;
      termAssignmentConfidence = inference.confidence;
      termAssignmentReason = inference.reason;
    }

    return {
      ...target,
      detectedInstitutionName: response.parsed.institutionName,
      detectedCourseCode: response.parsed.courseCode,
      detectedCourseTitle: response.parsed.courseTitle,
      parsedModules: response.parsed.modules,
      assignedProgramTerm: assignedTerm,
      termAssignmentSource,
      termAssignmentConfidence,
      termAssignmentReason,
      parseConfidence: response.parseConfidence,
      extractionMethod: response.extractionMethod,
      rawParsedJson: response.raw,
      parsingStatus: (!response.parsed.modules || response.parsed.modules.length === 0) ? "error" : "parsed",
      parseMessage: response.error
        ? response.error
        : response.parseMessage
        ? response.parseMessage
        : (!response.parsed.modules || response.parsed.modules.length === 0)
            ? "Parsing failed: No modules or curriculum topics could be extracted."
            : (response.usedFallback
                ? "Parsed using local fallback extraction; faculty review recommended."
                : "Parsed successfully by Gemini."),
    };
  }

  async function handleAnalyzeAll() {
    const pendingSyllabi =
      syllabi.length > 0
        ? syllabi
        : pastedText.trim()
          ? [
              {
                id: crypto.randomUUID(),
                fileName: "Pasted syllabus 1",
                rawText: pastedText,
                assignedProgramTerm: "Unassigned" as ProgramTermAssignment,
                parsedModules: [],
                parsingStatus: "pending" as const,
              },
            ]
          : [];

    if (!pendingSyllabi.length) {
      setMessage("Add at least one PDF or pasted syllabus before analyzing.");
      return;
    }

    setIsAnalyzing(true);
    setMessage("Analyzing syllabi one at a time...");
    setAnalysisTotal(pendingSyllabi.length);
    setAnalysisProgress(0);
    try {
      const analyzed: LocalUploadedSyllabus[] = [];
      for (let i = 0; i < pendingSyllabi.length; i++) {
        const parsedSyllabus = await analyzeSyllabus(pendingSyllabi[i]);
        analyzed.push(...splitSyllabusByCourse(parsedSyllabus));
        setAnalysisProgress(i + 1);
        if (i < pendingSyllabi.length - 1) {
          await new Promise((r) => setTimeout(r, 4500));
        }
      }
      setSyllabi(analyzed);
      setPastedText("");
      setMessage("Program curriculum map updated. Course codes were treated as metadata only.");
    } catch (e: any) {
      console.error(e);
      setMessage("An error occurred during analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  function downloadFiveTermReportPdf() {
    if (!syllabi.length && !pastedText.trim()) {
      setMessage("Add at least one syllabus before downloading the report.");
      return;
    }

    if (!isReportReady) {
      setMessage("Add at least one syllabus before downloading the report.");
      return;
    }

    const reportHtml = buildFiveTermReportHtml(programMap, syllabi);
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      setMessage("Please allow popups to print or save the report as PDF.");
      return;
    }
    printWindow.document.open();
    printWindow.document.write(reportHtml);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  }

  function downloadFiveTermReport() {
    if (!syllabi.length && !pastedText.trim()) {
      setMessage("Add at least one syllabus before downloading the report.");
      return;
    }

    if (!isReportReady) {
      setMessage("Add at least one syllabus before downloading the report.");
      return;
    }

    const reportHtml = buildFiveTermReportHtml(programMap, syllabi);
    const blob = new Blob(["\uFEFF", reportHtml], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `classmatelr-five-term-report-${new Date().toISOString().slice(0, 10)}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <h1>ClassmateLR Syllabus-to-Simulation Alignment Prototype</h1>
          <p>Assign each syllabus to a program term. Gemini parses; TypeScript rules assign simulations.</p>
        </div>
        <button
          type="button"
          className="theme-toggle"
          onClick={() => setIsDarkMode((darkMode) => !darkMode)}
          aria-label={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
          aria-pressed={isDarkMode}
          title={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
        >
          {isDarkMode ? <LucideSun size={18} /> : <LucideMoon size={18} />}
          <span>{isDarkMode ? "Light mode" : "Night mode"}</span>
        </button>
      </header>

      <section className="product-disclaimer" aria-label="Product disclaimer">
        <strong>Faculty decision-support only.</strong>
        <span> This tool supports syllabus review and simulation alignment; it is not automatic curriculum approval. Program terms are auto-assigned using ClassmateLR’s five-term training philosophy and may be adjusted by faculty.</span>
      </section>

      <section className="control-panel" aria-label="Syllabus controls">
        <label className="file-input">
          Upload syllabus files
          <input
            type="file"
            accept="application/pdf,.pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx,text/plain,.txt"
            multiple
            onChange={(event) => handleFiles(event.target.files)}
          />
        </label>

        <label className="text-area-label">
          Paste syllabus text
          <textarea
            value={pastedText}
            onChange={(event) => setPastedText(event.target.value)}
            placeholder="Paste a syllabus, course outline, weekly topics, and objectives here..."
          />
        </label>

        <div className="actions">
          <button type="button" className="secondary" onClick={addPastedSyllabus} disabled={!pastedText.trim()}>
            Add Pasted Syllabus
          </button>
          <button type="button" onClick={handleAnalyzeAll} disabled={isAnalyzing}>
            {isAnalyzing ? "Analyzing..." : "Analyze All Syllabi"}
          </button>
          {isReportReady && (
            <>
              <button type="button" className="secondary" onClick={downloadFiveTermReport} disabled={isAnalyzing}>
                Download Report (HTML)
              </button>
              <button type="button" className="secondary" onClick={downloadFiveTermReportPdf} disabled={isAnalyzing}>
                Print / Save PDF
              </button>
              <button type="button" className="secondary" onClick={generateCodebaseDocumentationPdf}>
                Download Documentation PDF
              </button>
            </>
          )}
          {/* Internal debug and syllabus preset controls are intentionally hidden for the faculty preview. */}
        </div>
        {isAnalyzing && analysisTotal > 0 && (
          <div className="progress-container">
            <progress value={analysisProgress} max={analysisTotal} />
            <p>Analyzed {analysisProgress} of {analysisTotal} syllabi</p>
          </div>
        )}
        {message && <p className="status-message">{message}</p>}
      </section>

      <section className="alignment-map" aria-label="Five-term alignment map">
        {programTerms.map((term) => (
          <div key={term} className="term-card">
            <span>{term}</span>
            <strong>{getTermRules(term).label}</strong>
            <small>{getTermRules(term).assignedTier}</small>
            <small>{syllabi.filter((syllabus) => syllabus.assignedProgramTerm === term && syllabus.parsingStatus !== "error").length} syllabus item(s)</small>
          </div>
        ))}
      </section>

      <section className="syllabus-list" aria-label="Uploaded syllabi">
        <h2>Uploaded Syllabi</h2>
        {syllabi.length === 0 ? (
          <p className="empty-state">Upload PDF or Word syllabi, or add pasted syllabus text to begin building the program map.</p>
        ) : (
          syllabi.map((syllabus) => (
            <article key={syllabus.id} className="syllabus-row">
              <div>
                <h3>{syllabus.fileName}</h3>
                <p>
                  {syllabus.detectedCourseTitle || "Course title not parsed yet"}
                  {syllabus.detectedCourseCode ? ` (${formatCourseCode(syllabus.detectedCourseCode)})` : ""}
                </p>
                <small>Parsing status: {syllabus.parsingStatus}</small>
                {syllabus.parseMessage && <small> - {syllabus.parseMessage}</small>}
                {syllabus.parseConfidence && <small> · Extraction confidence: {syllabus.parseConfidence}</small>}
                {syllabus.extractionMethod && <small> · Method: {syllabus.extractionMethod.replace(/_/g, " ")}</small>}
                {syllabus.parsingStatus === "error" && syllabus.fileName.toLowerCase().endsWith(".pdf") && (
                   <div style={{ color: "#d97706", fontSize: "0.85rem", marginTop: "4px" }}>
                     Paste this syllabus text below and re-run analysis.
                   </div>
                )}
                {syllabus.termAssignmentSource && (
                  <div style={{ fontSize: "0.85rem", color: "#6b7280", marginTop: "4px" }}>
                    Term assignment: {syllabus.termAssignmentSource} ({syllabus.termAssignmentConfidence} confidence)
                  </div>
                )}
                {syllabus.termAssignmentConfidence === "low" && syllabus.termAssignmentSource === "content_inference" && (
                  <div className="warning-text" style={{ color: "#d97706", fontSize: "0.85rem", marginTop: "4px" }}>
                    Needs faculty review: Term auto-assignment confidence is low.
                  </div>
                )}
              </div>
              <label>
                Program term
                <select
                  value={syllabus.assignedProgramTerm}
                  onChange={(event) => updateTerm(syllabus.id, event.target.value as ProgramTermAssignment)}
                >
                  <option value="Unassigned">Unassigned — faculty review required</option>
                  {programTerms.map((term) => (
                    <option key={term} value={term}>
                      {term}: {getTermRules(term).label}
                    </option>
                  ))}
                </select>
              </label>
              <div className="row-actions">
                <button type="button" className="secondary" onClick={() => removeSyllabus(syllabus.id)}>
                  Remove
                </button>
              </div>
            </article>
          ))
        )}
      </section>

      <section className="results-section" aria-label="Program term recommendations">
        <h2>Five-Term Program Curriculum Simulation Alignment Map</h2>

        <div className="workflow-explanatory-banner">
          <LucideLightbulb size={22} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <strong>Faculty Workflow Note:</strong> Yes! Instructors use this tool to discover syllabus-aligned simulation recommendations. Click <strong>"⚡ Create Classmate Assignment"</strong> on any recommended simulation to instantly convert it into a pre-configured Classmate assignment complete with learning objectives and debriefing questions.
          </div>
        </div>

        {programMap.map((termAlignment) => (
          <TermAlignmentSection
            key={termAlignment.term}
            termAlignment={termAlignment}
            createdAssignments={createdAssignments}
            onCreateAssignment={handleOpenAssignmentModal}
          />
        ))}
      </section>

      <CreatedAssignmentsPanel
        assignments={createdAssignments}
        onDeleteAssignment={handleDeleteAssignment}
        onClearAll={() => setCreatedAssignments([])}
      />

      {/* Bootstrap-Style Processing Modal with Static Backdrop */}
      <ProcessingModal
        isOpen={isAnalyzing}
        currentFileName={currentParsingSyllabus?.fileName}
        currentIndex={analysisProgress}
        totalFiles={analysisTotal}
        message={message}
      />

      {/* Classmate Assignment Creator Modal */}
      <ClassmateAssignmentModal
        isOpen={assignmentModalData.isOpen}
        onClose={() => setAssignmentModalData((prev) => ({ ...prev, isOpen: false }))}
        recommendation={assignmentModalData.recommendation}
        selectedSim={assignmentModalData.selectedSim}
        courseCode={assignmentModalData.courseCode}
        syllabusTitle={assignmentModalData.syllabusTitle}
        onSaveAssignment={handleSaveAssignment}
      />

    </main>
  );
}

function splitSyllabusByCourse(syllabus: LocalUploadedSyllabus): LocalUploadedSyllabus[] {
  if (syllabus.parsingStatus !== "parsed" || syllabus.parsedModules.length === 0) {
    return [syllabus];
  }

  const groups = new Map<string, typeof syllabus.parsedModules>();
  for (const module of syllabus.parsedModules) {
    const courseCode = module.courseCode?.trim() || syllabus.detectedCourseCode?.trim() || "";
    const courseTitle = module.courseTitle?.trim() || syllabus.detectedCourseTitle?.trim() || "";
    const normalizedTitle = courseTitle.toLowerCase().replace(/\b(respiratory care|respiratory)\b/g, "respiratory").replace(/[^a-z0-9]+/g, " ").trim();
    const key = courseCode ? `code:${courseCode.toLowerCase()}` : `title:${normalizedTitle}`;
    groups.set(key, [...(groups.get(key) || []), module]);
  }

  if (groups.size <= 1) return [syllabus];

  return Array.from(groups.values()).map((modules, index) => {
    const detectedCourseCode = modules.find(module => module.courseCode)?.courseCode;
    const detectedCourseTitle = modules.find(module => module.courseTitle)?.courseTitle;
    const assignment = syllabus.termAssignmentSource === "manual_override"
      ? null
      : inferProgramTermFromParsedSyllabus(modules, syllabus.fileName, detectedCourseCode);
    return {
      ...syllabus,
      id: `${syllabus.id}-course-${index + 1}`,
      sourceDocumentId: syllabus.sourceDocumentId || syllabus.id,
      sourceFileName: syllabus.sourceFileName || syllabus.fileName,
      fileName: `${syllabus.fileName} — ${detectedCourseCode || detectedCourseTitle || `Course ${index + 1}`}`,
      detectedCourseCode,
      detectedCourseTitle,
      parsedModules: modules,
      assignedProgramTerm: assignment?.term || syllabus.assignedProgramTerm,
      termAssignmentSource: assignment?.source || syllabus.termAssignmentSource,
      termAssignmentConfidence: assignment?.confidence || syllabus.termAssignmentConfidence,
      termAssignmentReason: assignment?.reason || syllabus.termAssignmentReason,
    };
  });
}

function TermAlignmentSection({
  termAlignment,
  createdAssignments,
  onCreateAssignment,
}: {
  termAlignment: ProgramTermAlignment;
  createdAssignments: ClassmateAssignment[];
  onCreateAssignment: (
    recommendation: SimRecommendationResult,
    selectedSim?: SimRecommendationResult["recommendedSims"][number] | null,
    courseCode?: string,
    syllabusTitle?: string,
  ) => void;
}) {
  return (
    <div className="term-results">
      <h3>
        {termAlignment.term}: {termAlignment.termLabel}
      </h3>
      {termAlignment.uploadedSyllabi.length === 0 ? (
        <p className="muted">No syllabi assigned to this term.</p>
      ) : (
        termAlignment.uploadedSyllabi.map((syllabus) => (
          <section key={syllabus.syllabusId} className="syllabus-results">
            <div className="syllabus-results-heading">
              <div>
                <h4>{syllabus.fileName}</h4>
                <p>
                  {syllabus.detectedCourseTitle || "Untitled course"}
                  {syllabus.detectedCourseCode ? ` (${formatCourseCode(syllabus.detectedCourseCode)})` : ""}
                </p>
                {syllabus.parseMessage && syllabus.parseMessage.includes("faculty review recommended") && (
                  <p style={{ color: "#d97706", fontSize: "0.85rem", marginTop: "4px" }}>
                    Fallback parsed - faculty review recommended.
                  </p>
                )}
              </div>
              <small>{syllabus.clinicalFocusSummary.map(fixSpacing).join(", ") || "Clinical focus not parsed yet"}</small>
            </div>
            {syllabus.recommendations.map((result, recIndex) => (
              <RecommendationCard
                key={`${syllabus.syllabusId}-${result.weekOrModule}-${result.topic}-${recIndex}`}
                result={result}
                courseCode={syllabus.detectedCourseCode}
                syllabusTitle={syllabus.detectedCourseTitle}
                createdAssignments={createdAssignments}
                onCreateAssignment={onCreateAssignment}
              />
            ))}
          </section>
        ))
      )}
    </div>
  );
}

function RecommendationCard({
  result,
  courseCode,
  syllabusTitle,
  createdAssignments,
  onCreateAssignment,
}: {
  result: SimRecommendationResult;
  courseCode?: string;
  syllabusTitle?: string;
  createdAssignments: ClassmateAssignment[];
  onCreateAssignment: (
    recommendation: SimRecommendationResult,
    selectedSim?: SimRecommendationResult["recommendedSims"][number] | null,
    courseCode?: string,
    syllabusTitle?: string,
  ) => void;
}) {
  return (
    <article className="recommendation-card">
      <div className="card-heading">
        <div>
          <h4>
            {fixSpacing(result.weekOrModule)}
            {result.courseCode ? ` · ${formatCourseCode(result.courseCode)}` : ""}
          </h4>
          <p>{fixSpacing(result.topic)}</p>
          {result.sourcePage && <small>Source page {result.sourcePage}</small>}
        </div>
        <span className={`status ${result.alignmentStatus.toLowerCase().replace(/\s+/g, "-")}`}>
          {result.alignmentStatus}
        </span>
      </div>

      <dl className="details-grid">
        <div>
          <dt>Assigned term</dt>
          <dd>{result.term}</dd>
        </div>
        <div>
          <dt>Assigned tier</dt>
          <dd>{result.assignedDifficultyTier}</dd>
        </div>
        <div>
          <dt>Bloom level</dt>
          <dd>{result.detectedBloomLevel}</dd>
        </div>
        <div>
          <dt>Topic exposure</dt>
          <dd>{result.topicExposureStatus}</dd>
        </div>
      </dl>

      <dl className="details-grid one-line">
        <div>
          <dt>Clinical focus</dt>
          <dd>{result.clinicalFocusSummary.map(fixSpacing).join(", ") || "Not detected"}</dd>
        </div>
      </dl>

      <div className="split">
        <section>
          <h5>Objectives</h5>
          <ul>
            {result.learningObjectives.length === 0 ? (
              <li>No objectives parsed.</li>
            ) : (
              result.learningObjectives.map((objective, objectiveIndex) => <li key={`${objectiveIndex}-${objective}`}>{fixSpacing(objective)}</li>)
            )}
          </ul>
        </section>
        <section>
          <h5>Appropriate simulations to pick from</h5>
          <ul>
            {result.appropriateSimPool.length === 0 ? (
              <li>No eligible scored sims.</li>
            ) : (
              result.appropriateSimPool.map((sim, idx) => (
                <li key={`${sim.id}-${idx}`}>
                  <strong>{fixSpacing(sim.name)}</strong> ({fixSpacing(sim.difficulty)}, score {sim.score}) - {fixSpacing(sim.whyAppropriate)}
                </li>
              ))
            )}
          </ul>
        </section>
      </div>

      <div className="split">
        <section>
          <h5>Readiness gates</h5>
          <ul>{result.readinessRequirements.map((item) => <li key={item}>{fixSpacing(item)}</li>)}</ul>
        </section>
        <section>
          <h5>Recommended learning cycle</h5>
          <ol>{result.implementationSequence.map((item) => <li key={item}>{fixSpacing(item)}</li>)}</ol>
        </section>
      </div>

      {result.recommendedSims.length > 0 && (
        <section className="best-picks">
          <h5>Best recommended simulation</h5>
          {result.recommendedSims.map((sim, idx) => {
            const isAssigned = createdAssignments.some(
              (a) => a.moduleTitle === result.topic && a.simName === sim.name,
            );

            return (
              <div key={`${sim.id}-${idx}`} className="pick">
                <strong>
                  {fixSpacing(sim.name)} · {fixSpacing(sim.difficulty)} · score {sim.score}
                </strong>
                <p>{fixSpacing(sim.rationale)}</p>
                <p>{fixSpacing(sim.bloomAlignment)}</p>
                <p>{fixSpacing(sim.readinessAlignment)}</p>
                <p>{fixSpacing(sim.instructorUseNote)}</p>
                {sim.not100PercentAlignmentNote && <p>{fixSpacing(sim.not100PercentAlignmentNote)}</p>}
                <DebriefList questions={sim.debriefQuestions} />

                {isAssigned ? (
                  <div className="assigned-in-classmate-badge">
                    <LucideCheckCircle2 size={16} /> Assigned in Classmate
                  </div>
                ) : (
                  <button
                    type="button"
                    className="create-assignment-cta"
                    onClick={() => onCreateAssignment(result, sim, courseCode, syllabusTitle)}
                  >
                    <LucideBookOpen size={16} /> Create Classmate Assignment
                  </button>
                )}
              </div>
            );
          })}
        </section>
      )}

      <section>
        <h5>Alignment note</h5>
        <p>{fixSpacing(result.alignmentNote)}</p>
      </section>

      <section>
        <h5>Rejected near-matches with reasons</h5>
        <ul>
          {result.rejectedNearMatches.map((sim, idx) => (
            <li key={`${sim.id}-${idx}`}>
              <strong>{fixSpacing(sim.name)}</strong> ({fixSpacing(sim.difficulty)}) - {fixSpacing(sim.reasonRejected)}
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}


function DebriefList({ questions }: { questions: SimRecommendationResult["recommendedSims"][number]["debriefQuestions"] }) {
  return (
    <div className="debrief">
      <h6>Debriefing questions</h6>
      <ul>
        {questions.allans3w.map((question, questionIndex) => (
          <li key={`${questionIndex}-${question}`}>{fixSpacing(question)}</li>
        ))}
        <li>{fixSpacing(questions.therapyIndication)}</li>
        <li>{fixSpacing(questions.therapyEffectiveness)}</li>
        <li>{fixSpacing(questions.setupAccuracy)}</li>
        <li>{fixSpacing(questions.evidenceRequired)}</li>
        <li>{fixSpacing(questions.stopChangeEscalate)}</li>
      </ul>
    </div>
  );
}

function inferProgramTerm(value: string): ProgramTermAssignment {
  const match = value.match(/\b(?:RT|RCP)\s*-?\s*(\d{3})(?:[^\d]|$)/i);
  if (!match) {
    return "Unassigned";
  }

  const courseNumber = Number(match[1]);
  if (courseNumber >= 380) return "Term 5";
  if (courseNumber >= 330) return "Term 4";
  if (courseNumber >= 300) return "Term 3";
  if (courseNumber >= 240) return "Term 2";
  return "Term 1";
}

function buildFiveTermReportHtml(programMap: ProgramTermAlignment[], syllabi: LocalUploadedSyllabus[]): string {
  const generatedAt = new Date().toLocaleString();
  const rawInstitution = syllabi.find(s => s.detectedInstitutionName)?.detectedInstitutionName;
  const institutionName = rawInstitution || "Respiratory Therapy Program";
  
  const allVerified = syllabi.length > 0 && syllabi.every(s =>
    s.parsingStatus === "parsed" &&
    s.assignedProgramTerm !== "Unassigned" &&
    s.extractionMethod !== "deterministic_fallback" &&
    (s.parseConfidence === "high" || s.parseConfidence === "medium")
  );
  const reportLabel = allVerified ? "Complete" : "Draft";
  const sourceDocuments = new Set(syllabi.map(s => s.sourceDocumentId || s.id));
  const parsedDocuments = new Set(syllabi.filter(s => s.parsingStatus === "parsed").map(s => s.sourceDocumentId || s.id));
  const parsedCount = parsedDocuments.size;
  
  let statusBanner = "";
  if (!allVerified) {
    const unassignedCount = syllabi.filter(s => s.assignedProgramTerm === "Unassigned").length;
    statusBanner = `<div class="status-banner"><strong>Draft Report:</strong> ${parsedCount} of ${sourceDocuments.size} source document(s) parsed into ${syllabi.filter(s => s.parsingStatus === "parsed").length} course record(s); ${unassignedCount} require faculty term assignment. Low-confidence or fallback results are not considered verified.</div>`;
  } else {
    statusBanner = `<div class="status-banner complete"><strong>${reportLabel} Report:</strong> All ${sourceDocuments.size} source document(s) parsed into ${syllabi.length} course record(s) and aligned successfully.</div>`;
  }

  const failedSyllabi = syllabi.filter(s => s.parsingStatus === "error");
  const failedSection = failedSyllabi.length > 0 ? `
    <div class="warning-section">
      <strong>Parsing Notice:</strong> ${failedSyllabi.map(s => `${escapeHtml(s.fileName)}: ${escapeHtml(s.parseMessage || "Error")}`).join('; ')}
    </div>
  ` : "";

  // Single Merged Master Curriculum Alignment Table Rows
  const mergedTableRows: string[] = [];
  
  programTerms.forEach((term) => {
    const termOverview = programOverview[term];
    const termMap = programMap.find(t => t.term === term);
    const uploadedInTerm = termMap ? termMap.uploadedSyllabi : [];

    if (uploadedInTerm.length === 0) {
      mergedTableRows.push(`
        <tr class="${termClass(term)}">
          <td><strong>${escapeHtml(term)}</strong><br/><span class="badge">${escapeHtml(termOverview.phase)}</span></td>
          <td><em>No courses mapped</em></td>
          <td>${termOverview.cognitiveFocus.slice(0, 2).map(escapeHtml).join("<br/>• ")}</td>
          <td>${escapeHtml(termOverview.recommendedOptions)}</td>
          <td><strong>${escapeHtml(termOverview.simDifficulty)}</strong><br/><small>Bloom: ${escapeHtml(termOverview.bloomLevel)}</small></td>
          <td><span class="status-pill weak">Pending Upload</span></td>
        </tr>
      `);
    } else {
      uploadedInTerm.forEach((syllabus) => {
        const parsedCourses = Array.from(new Map(
          syllabus.recommendations
            .filter(result => result.courseCode || result.courseTitle)
            .map(result => [
              `${result.courseCode || ""}|${result.courseTitle || ""}`,
              `${result.courseCode ? formatCourseCode(result.courseCode) : ""}${result.courseCode && result.courseTitle ? " — " : ""}${result.courseTitle || ""}`,
            ])
        ).values());
        const courseDisplay = parsedCourses.length > 0
          ? parsedCourses.map(course => `<strong>${cleanAndEscape(course)}</strong>`).join("<br/>")
          : `<strong>${cleanAndEscape(syllabus.detectedCourseTitle || syllabus.fileName)}</strong>`;

        // Gather top recommendations for this syllabus
        const topRecs = syllabus.recommendations.map(r => r.recommendedSims[0]).filter(Boolean);
        let simDisplay = "<em>Faculty Selection Needed</em>";
        let scoreDisplay = "N/A";
        let statusBadge = `<span class="status-pill partial">Faculty Review</span>`;
        let diffTier = termOverview.simDifficulty;

        if (topRecs.length > 0) {
          const topSim = topRecs[0];
          scoreDisplay = `${topSim.score}%`;
          diffTier = topSim.difficulty;
          const statusClass = topSim.score >= 85 ? "full" : topSim.score >= 70 ? "partial" : "weak";
          statusBadge = `<span class="status-pill ${statusClass}">${topSim.score >= 85 ? "Full Alignment" : "Partial Alignment"}</span>`;
          
          const simNames = Array.from(new Set(topRecs.map(s => s.name))).slice(0, 2);
          simDisplay = simNames.map(name => `<strong>${cleanAndEscape(name)}</strong>`).join("<br/>");
        }

        mergedTableRows.push(`
          <tr class="${termClass(term)}">
            <td><strong>${escapeHtml(term)}</strong><br/><span class="badge">${escapeHtml(termOverview.phase)}</span></td>
            <td>${courseDisplay}</td>
            <td>${termOverview.cognitiveFocus.slice(0, 2).map(escapeHtml).join("<br/>• ")}</td>
            <td>${simDisplay}</td>
            <td><strong>${escapeHtml(diffTier)}</strong><br/><small>Score: ${scoreDisplay}</small></td>
            <td>${statusBadge}</td>
          </tr>
        `);
      });
    }
  });

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>ClassmateLR Executive SIM / Syllabi Alignment Report</title>
  <style>
    @page { size: letter; margin: 0.55in; }
    body { box-sizing: border-box; color: #1e293b; font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; line-height: 1.25; margin: 0; padding: 0 0.06in; background: #ffffff; font-size: 10.5px; }
    
    /* Executive Header */
    .header-container { text-align: center; border-bottom: 2px solid #0b168a; padding-bottom: 8px; margin-bottom: 10px; }
    .institution-name { font-size: 18px; font-weight: 800; color: #0b168a; margin: 0; text-transform: uppercase; letter-spacing: 0.5px; }
    .program-title { font-size: 14px; font-weight: 700; color: #1e293b; margin: 2px 0 0 0; }
    .report-subtitle { font-size: 11px; font-weight: 600; color: #475569; margin: 2px 0 0 0; }
    .report-meta { font-size: 9.5px; color: #64748b; margin-top: 2px; }
    
    /* Section Headings */
    .section-header { background: #0b168a; color: #ffffff; font-size: 11px; font-weight: 700; padding: 4px 8px; margin-top: 10px; margin-bottom: 6px; border-radius: 3px; text-transform: uppercase; letter-spacing: 0.4px; }
    h3 { font-size: 11.5px; color: #0b168a; margin: 8px 0 4px 0; border-bottom: 1px solid #cbd5e1; padding-bottom: 2px; }
    
    p, li { font-size: 10px; color: #334155; margin: 3px 0; }
    
    /* Callout & Disclaimer Boxes */
    .callout-box { background: #f8fafc; border-left: 3px solid #0b168a; padding: 6px 10px; margin: 6px 0; border-radius: 0 3px 3px 0; font-size: 10px; }
    .disclaimer-box { background: #fffbeb; border: 1px solid #fde68a; border-left: 3px solid #d97706; padding: 6px 10px; margin: 6px 0; border-radius: 3px; font-size: 10px; }
    .status-banner { background: #eff6ff; border: 1px solid #bfdbfe; padding: 5px 8px; margin-bottom: 8px; border-radius: 3px; font-size: 10px; }
    .status-banner.complete { background: #f0fdf4; border-color: #bbf7d0; color: #166534; }
    .warning-section { background: #fef2f2; border: 1px solid #fecaca; padding: 5px 8px; margin-bottom: 8px; border-radius: 3px; color: #991b1b; font-size: 9.5px; }
    
    /* Table Styling */
    table { width: 100%; border-collapse: collapse; margin: 6px 0 10px; font-size: 9.5px; page-break-inside: avoid; }
    th { background: #1e293b; color: #ffffff; font-weight: 700; padding: 5px 6px; text-align: left; border: 1px solid #334155; }
    td { border: 1px solid #cbd5e1; padding: 4px 6px; vertical-align: top; }
    
    .term-1 { background: #ffffff; }
    .term-2 { background: #f8fafc; }
    .term-3 { background: #f0f9ff; }
    .term-4 { background: #fffbeb; }
    .term-5 { background: #fef2f2; }
    
    .badge { display: inline-block; background: #e2e8f0; color: #334155; padding: 1px 4px; border-radius: 2px; font-size: 9px; font-weight: 600; }
    .status-pill { display: inline-block; padding: 1px 6px; border-radius: 8px; font-size: 9px; font-weight: 700; text-transform: uppercase; }
    .status-pill.full { background: #dcfce7; color: #166534; }
    .status-pill.partial { background: #fef9c3; color: #854d0e; }
    .status-pill.weak { background: #ffedd5; color: #9a3412; }
    
    ul, ol { margin: 2px 0 4px 14px; padding: 0; }
    li { margin-bottom: 1px; }
    
    .page-break { page-break-before: always; }
    
    @media print {
      body { margin: 0; padding: 0 0.06in; }
      tr { page-break-inside: avoid; }
    }
  </style>
</head>
<body>

  <!-- HEADER -->
  <div class="header-container">
    <div class="institution-name">${escapeHtml(institutionName)}</div>
    <div class="program-title">Respiratory Therapy Program</div>
    <div class="report-subtitle">ClassmateLR SIM / Syllabi Alignment Report (Executive Summary)</div>
    <div class="report-meta">Executive Curriculum Alignment &amp; NBRC Examination Readiness Analysis • Generated ${escapeHtml(generatedAt)}</div>
  </div>

  ${statusBanner}
  ${failedSection}

  <!-- SECTION I -->
  <div class="section-header">Section I: NBRC RTE at a Glance &amp; Preparation Gap</div>
  <div class="callout-box">
    <p style="margin:0;"><strong>The NBRC Examination Challenge &amp; Preparation Gap:</strong> The NBRC Respiratory Therapist Examination (RTE) evaluates candidates across <strong>Breadth of Knowledge</strong> (recalling formulas, indications, parameters) and <strong>Depth of Clinical Judgment</strong> (evaluating real-time patient status, executing multi-step interventions). Traditional instruction establishes foundational recall, but students often experience a preparation gap transitioning to clinical decision-making. Early, longitudinal simulation integration eliminates this gap by embedding decision-making directly alongside didactic concepts from Term 1 through graduation.</p>
  </div>

  <!-- SECTION II -->
  <div class="section-header">Section II: The Kettering RTE Solution</div>
  <p style="margin:2px 0;"><strong>Building Progressive Readiness via ClassmateLR:</strong> Kettering National Seminars (KNS) partners with Respiratory Care programs to implement structured, early simulation integration using ClassmateLR. KNS aligns simulations across the <strong>Kettering Clinical Reasoning &amp; Decision-Making Ladder</strong>:</p>
  <ul>
    <li><strong>Terms 1–2 (Breadth of Knowledge):</strong> Early foundational cases (Oxygenation, Airway, Bronchial Hygiene) reinforce core clinical principles.</li>
    <li><strong>Terms 3–5 (Depth of Clinical Judgment):</strong> Progressive scenarios (Mechanical Ventilation, ICU Hemodynamics, Pediatric Adaptation, CSE Problem Sets) build rapid autonomous decision-making.</li>
  </ul>

  <!-- SECTION III -->
  <div class="section-header">Section III: SIM/Syllabi Report Instructions &amp; Disclaimer</div>
  <div class="disclaimer-box">
    <strong>KNS Faculty Disclaimer &amp; Educational Freedom:</strong>
    <span> This report provides a suggested SIM/Syllabi alignment framework based on ClassmateLR’s 5-term philosophy. Program Directors (PD) and Directors of Clinical Education (DCE) maintain full authority to adjust or reorder simulations to match institution course sequencing.</span>
  </div>

  <p style="margin:2px 0;"><strong>SIM Match Score Guide (0–100%):</strong> <strong>85–100% (High Alignment):</strong> Primary recommended match. <strong>70–84% (Moderate Alignment):</strong> Secondary/lab practice fit. <strong>50–69% (Partial Alignment):</strong> Sub-topic bridge. Course placement is governed by ClassmateLR's Five-Term Cognitive Progression Rules.</p>

  <div class="callout-box" style="margin-top:4px;">
    <strong>Standardized Kettering 6-Point Debriefing Model:</strong>
    <ol style="margin:2px 0 2px 14px; padding:0;">
      <li><strong>Allan's 3 Ws:</strong> <em>What happened? Why did it happen? What will you do next time?</em></li>
      <li><strong>Therapy Indication &amp; Effectiveness:</strong> <em>What evidence justified therapy and confirmed success?</em></li>
      <li><strong>Setup &amp; Rationale:</strong> <em>Were equipment parameters accurate per AARC clinical practice guidelines?</em></li>
      <li><strong>Stop, Change, or Escalate:</strong> <em>At what clinical threshold should therapy be modified or escalated?</em></li>
    </ol>
  </div>

  <!-- PAGE BREAK TO ENSURE TABLE IS NEATLY ON PAGE 2 IF NEEDED -->
  <div class="page-break"></div>

  <!-- SECTION IV -->
  <div class="section-header">Section IV: Customer SIM/Syllabi Program Alignment Report</div>
  <p style="margin:2px 0;"><strong>Consolidated Executive Master Program Alignment Chart:</strong> Below is the unified course-by-course and term-by-term curriculum alignment matrix mapping syllabus courses to ClassmateLR simulations.</p>

  <table>
    <thead>
      <tr>
        <th style="width:14%;">Term &amp; Phase</th>
        <th style="width:22%;">Mapped Course(s)</th>
        <th style="width:20%;">Cognitive Focus</th>
        <th style="width:22%;">Recommended ClassmateLR SIM</th>
        <th style="width:12%;">Difficulty Tier</th>
        <th style="width:10%;">Alignment Status</th>
      </tr>
    </thead>
    <tbody>
      ${mergedTableRows.join("")}
    </tbody>
  </table>

  <div class="callout-box" style="margin-top:8px;">
    <strong>Faculty Leadership &amp; Program Oversight:</strong> This alignment report serves as a strategic roadmap for integrating ClassmateLR into lab syllabi, clinical preparation courses, and end-of-program NBRC credentialing reviews.
  </div>

</body>
</html>`;
}

function reportRecommendationCard(result: SimRecommendationResult): string {
  const topSim = result.recommendedSims[0];
  if (!topSim) {
    return `
      <div class="recommendation">
        <strong>${cleanAndEscape(result.weekOrModule)}: ${cleanAndEscape(result.topic)}</strong>
        <p><em>No direct simulation match found. Faculty review recommended for this topic.</em></p>
      </div>`;
  }

  const codeStr = result.courseCode ? `${formatCourseCode(result.courseCode)} · ` : "";

  return `
    <div class="recommendation">
      <strong>${codeStr}${cleanAndEscape(result.weekOrModule)}: ${cleanAndEscape(result.topic)}</strong>
      <p style="margin:4px 0;"><strong>Primary Recommended SIM:</strong> ${cleanAndEscape(topSim.name)} (${cleanAndEscape(topSim.difficulty)}, Match Score: <strong>${topSim.score}%</strong>)</p>
      <p style="margin:4px 0;"><strong>Rationale:</strong> ${cleanAndEscape(topSim.rationale)} ${cleanAndEscape(topSim.instructorUseNote)}</p>
      ${result.alignmentNote ? `<p style="margin:4px 0; font-size:11px; color:#64748b;"><em>Alignment Note: ${cleanAndEscape(result.alignmentNote)}</em></p>` : ""}
    </div>`;
}

function termClass(term: ProgramTerm): string {
  return term.toLowerCase().replace(/\s+/g, "-");
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/’/g, "&rsquo;")
    .replace(/‘/g, "&lsquo;")
    .replace(/“/g, "&ldquo;")
    .replace(/”/g, "&rdquo;")
    .replace(/•/g, "&bull;")
    .replace(/–/g, "&ndash;")
    .replace(/—/g, "&mdash;")
    .replace(/·/g, "&middot;");
}

function fixSpacing(value: string): string {
  return value
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/ventilationforindividualswithrespiratoryproblems/ig, "ventilation for individuals with respiratory problems")
    .replace(/Describetheindications/ig, "Describe the indications")
    .replace(/This willinclude/ig, "This will include")
    .replace(/endotrachealtubes/ig, "endotracheal tubes")
    .replace(/laryngealmaskairways/ig, "laryngeal mask airways")
    .replace(/andrelated/ig, "and related")
    .replace(/Thenapplythese principlesto/ig, "Then apply these principles to");
}

function cleanAndEscape(value: string): string {
  return escapeHtml(fixSpacing(value));
}

export default App;
