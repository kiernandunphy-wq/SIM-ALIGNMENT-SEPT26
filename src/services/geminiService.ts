import type {
  BloomLevel,
  ParsedSyllabusModule,
  ParsedSyllabusResponse,
  TopicExposureStatus,
} from "../types";
import { fileToBase64 } from "../utils/text";

const bloomLevels: BloomLevel[] = ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"];
const exposureStatuses: TopicExposureStatus[] = [
  "first_introduction",
  "review_reinforcement",
  "builds_on_prior_sim",
  "remediation",
  "integration_assessment",
  "end_of_program_mastery",
];
const maxPastedTextChars = 200_000;
const maxFileBytes = 8 * 1024 * 1024;
const acceptedFileTypes = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]);
const acceptedFileExtensions = [".pdf", ".docx", ".txt"];

export const fallbackParsedSyllabus: ParsedSyllabusResponse = {
  courseTitle: "Respiratory Care Therapeutics and Diagnostics",
  courseDescription: "Foundational respiratory therapeutics and diagnostic interpretation.",
  learningObjectives: [
    "Select oxygen and aerosol therapy based on patient findings.",
    "Interpret introductory diagnostic data and patient response.",
  ],
  modules: [
    {
      courseTitle: "Respiratory Care Therapeutics and Diagnostics",
      weekOrModule: "Module 1",
      topic: "Oxygen therapy and pulse oximetry",
      learningObjectives: [
        "Select appropriate oxygen delivery devices.",
        "Interpret pulse oximetry findings in context.",
      ],
      detectedBloomLevel: "Apply",
      clinicalFocus: {
        patientPopulation: ["adult"],
        pathologies: ["hypoxemia", "COPD"],
        therapies: ["oxygen therapy"],
        equipment: ["nasal cannula", "simple mask", "pulse oximeter"],
        assessmentData: ["SpO2", "vital signs", "breath sounds"],
        skills: ["oxygen setup", "patient assessment", "oxygen titration"],
        decisionTypes: ["therapy indication", "therapy effectiveness"],
      },
      topicExposureStatus: "first_introduction",
    },
    {
      courseTitle: "Respiratory Care Therapeutics and Diagnostics",
      weekOrModule: "Module 2",
      topic: "Aerosol therapy for COPD/pneumonia",
      learningObjectives: [
        "Identify indications for aerosolized bronchodilator therapy.",
        "Evaluate patient response to aerosol therapy.",
      ],
      detectedBloomLevel: "Apply",
      clinicalFocus: {
        patientPopulation: ["adult"],
        pathologies: ["COPD", "pneumonia", "bronchospasm"],
        therapies: ["aerosol therapy", "oxygen therapy"],
        equipment: ["small volume nebulizer", "MDI", "pulse oximeter"],
        assessmentData: ["SpO2", "breath sounds", "respiratory rate"],
        skills: ["aerosol delivery", "equipment setup", "assessment"],
        decisionTypes: ["therapy selection", "therapy effectiveness"],
      },
      topicExposureStatus: "first_introduction",
    },
    {
      courseTitle: "Respiratory Care Therapeutics and Diagnostics",
      weekOrModule: "Module 3",
      topic: "Introductory ABG interpretation",
      learningObjectives: [
        "Differentiate oxygenation and ventilation problems using ABG data.",
        "Recommend appropriate next steps based on basic ABG interpretation.",
      ],
      detectedBloomLevel: "Analyze",
      clinicalFocus: {
        patientPopulation: ["adult"],
        pathologies: ["hypoxemia", "hypercapnia"],
        therapies: ["oxygen therapy", "ventilation support"],
        equipment: ["ABG report", "oxygen device"],
        assessmentData: ["PaO2", "PaCO2", "pH", "HCO3"],
        skills: ["ABG interpretation", "data interpretation"],
        decisionTypes: ["diagnostic interpretation", "therapy escalation"],
      },
      topicExposureStatus: "first_introduction",
    },
    {
      courseTitle: "Respiratory Care Therapeutics and Diagnostics",
      weekOrModule: "Module 4",
      topic: "Bronchial hygiene and patient response",
      learningObjectives: [
        "Select bronchial hygiene therapy based on patient findings.",
        "Determine whether airway clearance therapy is effective.",
      ],
      detectedBloomLevel: "Apply",
      clinicalFocus: {
        patientPopulation: ["adult"],
        pathologies: ["pneumonia", "retained secretions", "atelectasis"],
        therapies: ["bronchial hygiene", "airway clearance"],
        equipment: ["PEP device", "suction catheter"],
        assessmentData: ["sputum", "breath sounds", "radiograph", "SpO2"],
        skills: ["bronchial hygiene", "suctioning", "assessment"],
        decisionTypes: ["therapy selection", "therapy effectiveness", "change therapy"],
      },
      topicExposureStatus: "first_introduction",
    },
  ],
};

export async function parseSyllabusWithGemini(
  syllabusText: string,
  syllabusFile?: File | null,
): Promise<{ parsed: ParsedSyllabusResponse; raw: unknown; usedFallback: boolean; error?: string; parseMessage?: string; parseConfidence?: "high" | "medium" | "low"; extractionMethod?: "text" | "visual_pdf" | "deterministic_fallback" }> {
  try {
    validateParserInput(syllabusText, syllabusFile);

    const response = await fetch("/api/parse-syllabus", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        syllabusText,
        file: syllabusFile
          ? {
              name: syllabusFile.name,
              mimeType: syllabusFile.type || "application/pdf",
              size: syllabusFile.size,
              data: await fileToBase64(syllabusFile),
            }
          : null,
      }),
    });

    if (response.ok) {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        const parsed = sanitizeParsedResponse(data.parsed);
        return { 
          parsed, 
          raw: data.raw ?? data.parsed, 
          usedFallback: data.usedFallback || false, 
          parseMessage: data.parseMessage || undefined,
          parseConfidence: data.parseConfidence || undefined,
          extractionMethod: data.extractionMethod || undefined,
        };
      }
    } else {
      const errText = await response.text();
      let errorMsg = `API request failed with status ${response.status}`;
      try {
        const errJson = JSON.parse(errText);
        if (errJson.error) {
          errorMsg = errJson.details ? `${errJson.error}: ${errJson.details}` : errJson.error;
        }
      } catch {
        if (errText) errorMsg = errText;
      }
      return {
        parsed: { courseTitle: "Unparsed", courseDescription: "", learningObjectives: [], modules: [] },
        raw: null,
        usedFallback: true,
        error: errorMsg,
      };
    }
  } catch (error: any) {
    console.log("API response status notice:", error?.message || String(error));
    return {
      parsed: { courseTitle: "Unparsed", courseDescription: "", learningObjectives: [], modules: [] },
      raw: null,
      usedFallback: true,
      error: error?.message || String(error),
    };
  }

  return {
    parsed: { courseTitle: "Unparsed", courseDescription: "", learningObjectives: [], modules: [] },
    raw: null,
    usedFallback: true,
    error: "Failed to parse syllabus.",
  };
}

function validateParserInput(syllabusText: string, syllabusFile?: File | null) {
  if (syllabusText.length > maxPastedTextChars) {
    throw new Error(`Pasted syllabus text is too long. Limit is ${maxPastedTextChars.toLocaleString()} characters.`);
  }

  if (!syllabusFile) {
    return;
  }

  const lowerName = syllabusFile.name.toLowerCase();
  const hasAcceptedExtension = acceptedFileExtensions.some((extension) => lowerName.endsWith(extension));
  const hasAcceptedType = acceptedFileTypes.has(syllabusFile.type);

  if (!hasAcceptedType && !hasAcceptedExtension) {
    throw new Error("Unsupported file type. Upload PDF, DOCX, or TXT files only.");
  }

  if (syllabusFile.size > maxFileBytes) {
    throw new Error(`Uploaded file is too large. Limit is ${Math.floor(maxFileBytes / 1024 / 1024)} MB per file.`);
  }
}

function sanitizeParsedResponse(raw: unknown): ParsedSyllabusResponse {
  const value = raw as Partial<ParsedSyllabusResponse>;
  const modules = Array.isArray(value.modules) ? value.modules.map(sanitizeModule).filter(Boolean) : [];
  return {
    institutionName: stringOrUndefined(value.institutionName),
    courseCode: stringOrUndefined(value.courseCode),
    courseTitle: stringOrUndefined(value.courseTitle),
    courseDescription: stringOrUndefined(value.courseDescription),
    learningObjectives: stringArray(value.learningObjectives),
    modules: modules as ParsedSyllabusModule[],
  };
}

function sanitizeModule(raw: unknown): ParsedSyllabusModule {
  const module = raw as Partial<ParsedSyllabusModule>;
  const focus = (module.clinicalFocus ?? {}) as Partial<ParsedSyllabusModule["clinicalFocus"]>;
  return {
    courseCode: stringOrUndefined(module.courseCode),
    courseTitle: stringOrUndefined(module.courseTitle),
    sourcePage: typeof module.sourcePage === "number" && Number.isFinite(module.sourcePage) && module.sourcePage > 0
      ? Math.floor(module.sourcePage)
      : undefined,
    weekOrModule: stringOrUndefined(module.weekOrModule) || "Module",
    topic: stringOrUndefined(module.topic) || "Unspecified topic",
    learningObjectives: stringArray(module.learningObjectives),
    detectedBloomLevel: bloomLevels.includes(module.detectedBloomLevel as BloomLevel)
      ? (module.detectedBloomLevel as BloomLevel)
      : "Understand",
    clinicalFocus: {
      patientPopulation: stringArray(focus.patientPopulation),
      pathologies: stringArray(focus.pathologies),
      therapies: stringArray(focus.therapies),
      equipment: stringArray(focus.equipment),
      assessmentData: stringArray(focus.assessmentData),
      skills: stringArray(focus.skills),
      decisionTypes: stringArray(focus.decisionTypes),
    },
    topicExposureStatus: exposureStatuses.includes(module.topicExposureStatus as TopicExposureStatus)
      ? (module.topicExposureStatus as TopicExposureStatus)
      : "first_introduction",
  };
}

function stringOrUndefined(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && Boolean(item.trim()))
    : [];
}
