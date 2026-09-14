import React, { useState, useEffect } from "react";
import {
  LucideBookOpen,
  LucideCheck,
  LucideCopy,
  LucideCalendar,
  LucideAward,
  LucideFileSpreadsheet,
  LucideX,
  LucideListTodo,
  LucideHelpCircle,
  LucideSparkles,
  LucideCheckCircle2,
} from "lucide-react";
import type { ClassmateAssignment, SimRecommendationResult } from "../types";

interface ClassmateAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  recommendation: SimRecommendationResult | null;
  selectedSim?: SimRecommendationResult["recommendedSims"][number] | null;
  courseCode?: string;
  syllabusTitle?: string;
  onSaveAssignment: (assignment: ClassmateAssignment) => void;
}

export function ClassmateAssignmentModal({
  isOpen,
  onClose,
  recommendation,
  selectedSim,
  courseCode,
  syllabusTitle,
  onSaveAssignment,
}: ClassmateAssignmentModalProps) {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [points, setPoints] = useState(50);
  const [studentInstructions, setStudentInstructions] = useState("");
  const [selectedObjectives, setSelectedObjectives] = useState<string[]>([]);
  const [debriefQuestionsList, setDebriefQuestionsList] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [savedStatus, setSavedStatus] = useState<string | null>(null);

  // Pre-fill state when recommendation changes
  useEffect(() => {
    if (!recommendation) return;

    const sim = selectedSim || recommendation.recommendedSims[0];
    const simName = sim ? sim.name : "Simulation Activity";

    // Set default due date to 7 days from today
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 7);
    setDueDate(defaultDate.toISOString().slice(0, 10));

    // Default title
    const prefix = courseCode ? `${courseCode}: ` : "";
    setTitle(`${prefix}${recommendation.topic} - Classmate Simulation (${simName})`);

    // Default student instructions
    setStudentInstructions(
      `Welcome to your Classmate simulation assignment for ${recommendation.topic}.\n\n` +
      `• Objective: Complete the "${simName}" interactive clinical simulation in Classmate.\n` +
      `• Difficulty Tier: ${sim ? sim.difficulty : "Standard"}\n` +
      `• Instructions: Review the clinical case details, evaluate patient vital signs and assessment data, and execute appropriate respiratory therapy interventions. Complete the post-sim reflection debriefing questions upon finishing.`,
    );

    // Default objectives
    setSelectedObjectives([...recommendation.learningObjectives]);

    // Gather debrief questions
    if (sim && sim.debriefQuestions) {
      const questions: string[] = [
        ...(sim.debriefQuestions.allans3w || []),
        sim.debriefQuestions.therapyIndication,
        sim.debriefQuestions.therapyEffectiveness,
        sim.debriefQuestions.setupAccuracy,
        sim.debriefQuestions.evidenceRequired,
        sim.debriefQuestions.stopChangeEscalate,
      ].filter(Boolean);
      setDebriefQuestionsList(questions);
    } else {
      setDebriefQuestionsList([
        "What went well during this simulation?",
        "What would you do differently if you faced a similar clinical scenario?",
        "What key clinical indicator prompted your therapeutic decision?",
      ]);
    }

    setSavedStatus(null);
  }, [recommendation, selectedSim, courseCode]);

  if (!isOpen || !recommendation) return null;

  const sim = selectedSim || recommendation.recommendedSims[0];
  const simName = sim ? sim.name : "Respiratory Care Simulation";
  const simDifficulty = sim ? sim.difficulty : "Basic";

  const handleToggleObjective = (obj: string) => {
    setSelectedObjectives((prev) =>
      prev.includes(obj) ? prev.filter((o) => o !== obj) : [...prev, obj],
    );
  };

  const handleCopyLink = () => {
    const fakeLink = `https://classmatelr/assignments/create?sim=${encodeURIComponent(
      simName,
    )}&term=${encodeURIComponent(recommendation.term)}&topic=${encodeURIComponent(
      recommendation.topic,
    )}`;
    navigator.clipboard.writeText(fakeLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePublish = (status: "published" | "draft") => {
    const newAssignment: ClassmateAssignment = {
      id: `assignment-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title,
      courseCode: courseCode || recommendation.courseCode,
      moduleTitle: recommendation.topic,
      term: recommendation.term,
      simId: sim ? sim.id : "sim-1",
      simName,
      simDifficulty,
      objectives: selectedObjectives,
      debriefQuestions: debriefQuestionsList,
      dueDate,
      points,
      studentInstructions,
      createdAt: new Date().toLocaleDateString(),
      status,
    };

    onSaveAssignment(newAssignment);
    setSavedStatus(
      status === "published"
        ? "Assignment published to Classmate!"
        : "Assignment saved as Classmate Draft!",
    );
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleExportJson = () => {
    const exportData = {
      classmateAssignmentVersion: "1.0",
      title,
      courseCode: courseCode || recommendation.courseCode,
      topic: recommendation.topic,
      term: recommendation.term,
      simulation: {
        id: sim ? sim.id : "",
        name: simName,
        difficulty: simDifficulty,
      },
      objectives: selectedObjectives,
      debriefingPrompts: debriefQuestionsList,
      dueDate,
      points,
      studentInstructions,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `classmate-assignment-${simName.toLowerCase().replace(/\s+/g, "-")}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="classmate-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="classmate-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="classmate-modal-header">
          <div className="title-area">
            <div className="classmate-badge">
              <LucideSparkles size={16} /> Classmate Assignment Creator
            </div>
            <h2>Create Classmate Assignment</h2>
            <p className="subtitle">
              Converting recommended simulation <strong>"{simName}"</strong> into an active Classmate student assignment.
            </p>
          </div>
          <button type="button" className="close-btn" onClick={onClose} aria-label="Close modal">
            <LucideX size={20} />
          </button>
        </div>

        {savedStatus ? (
          <div className="assignment-success-state">
            <LucideCheckCircle2 size={48} className="success-icon" />
            <h3>{savedStatus}</h3>
            <p>Students enrolled in this course can now access the simulation in Classmate.</p>
          </div>
        ) : (
          <div className="classmate-modal-body">
            {/* Context Callout */}
            <div className="context-callout">
              <div>
                <strong>Syllabus Alignment Context:</strong>
                <span>
                  {" "}
                  {recommendation.weekOrModule} · {recommendation.topic} ({recommendation.term})
                </span>
              </div>
              <div className="sim-meta-pill">
                Sim: <strong>{simName}</strong> ({simDifficulty})
              </div>
            </div>

            <div className="form-grid">
              {/* Assignment Title */}
              <label className="full-width">
                <span>Assignment Title</span>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Oxygen Therapy Simulation Assignment"
                />
              </label>

              {/* Due Date */}
              <label>
                <span>Due Date</span>
                <div className="input-icon-wrap">
                  <LucideCalendar size={18} className="input-icon" />
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              </label>

              {/* Points */}
              <label>
                <span>Point Value</span>
                <div className="input-icon-wrap">
                  <LucideAward size={18} className="input-icon" />
                  <input
                    type="number"
                    min={0}
                    max={500}
                    value={points}
                    onChange={(e) => setPoints(Number(e.target.value))}
                  />
                </div>
              </label>

              {/* Learning Objectives Checkbox Group */}
              <div className="full-width objectives-group">
                <span className="group-label">
                  <LucideListTodo size={16} /> Attached Learning Objectives (from Syllabus)
                </span>
                <div className="objectives-list">
                  {recommendation.learningObjectives.map((obj, i) => (
                    <label key={`obj-${i}-${obj}`} className="objective-checkbox-item">
                      <input
                        type="checkbox"
                        checked={selectedObjectives.includes(obj)}
                        onChange={() => handleToggleObjective(obj)}
                      />
                      <span>{obj}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Debrief & Reflection Questions */}
              <div className="full-width debrief-group">
                <span className="group-label">
                  <LucideHelpCircle size={16} /> Debriefing &amp; Reflection Questions (Pre-populated)
                </span>
                <div className="debrief-box">
                  <ul>
                    {debriefQuestionsList.map((q, idx) => (
                      <li key={`q-${idx}-${q}`}>{q}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Student Instructions */}
              <label className="full-width">
                <span>Student Instructions</span>
                <textarea
                  rows={4}
                  value={studentInstructions}
                  onChange={(e) => setStudentInstructions(e.target.value)}
                  placeholder="Provide guidance for students completing this simulation..."
                />
              </label>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        {!savedStatus && (
          <div className="classmate-modal-footer">
            <div className="left-actions">
              <button
                type="button"
                className="secondary"
                onClick={handleCopyLink}
                title="Copy Classmate assignment link"
              >
                {copied ? <LucideCheck size={16} /> : <LucideCopy size={16} />}
                {copied ? "Link Copied!" : "Copy Link"}
              </button>
              <button
                type="button"
                className="secondary"
                onClick={handleExportJson}
                title="Export assignment JSON package"
              >
                <LucideFileSpreadsheet size={16} />
                Export LMS JSON
              </button>
            </div>
            <div className="right-actions">
              <button
                type="button"
                className="secondary"
                onClick={() => handlePublish("draft")}
              >
                Save Draft
              </button>
              <button
                type="button"
                className="primary-btn"
                onClick={() => handlePublish("published")}
              >
                <LucideBookOpen size={16} />
                Publish to Classmate
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
