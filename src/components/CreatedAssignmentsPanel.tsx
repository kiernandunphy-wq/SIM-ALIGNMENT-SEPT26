import React from "react";
import {
  LucideBookOpen,
  LucideCalendar,
  LucideAward,
  LucideTrash2,
  LucideDownload,
  LucideExternalLink,
  LucideCheckCircle2,
  LucideListCheck,
  LucideSparkles,
} from "lucide-react";
import type { ClassmateAssignment } from "../types";

interface CreatedAssignmentsPanelProps {
  assignments: ClassmateAssignment[];
  onDeleteAssignment: (id: string) => void;
  onClearAll: () => void;
}

export function CreatedAssignmentsPanel({
  assignments,
  onDeleteAssignment,
  onClearAll,
}: CreatedAssignmentsPanelProps) {
  if (assignments.length === 0) return null;

  const handleExportAll = () => {
    const blob = new Blob([JSON.stringify(assignments, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `classmate-assignments-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <section className="created-assignments-panel" aria-label="Created Classmate Assignments">
      <div className="panel-header">
        <div>
          <div className="panel-badge">
            <LucideSparkles size={16} /> Classmate LMS Integration
          </div>
          <h2>Assignments Created in Classmate ({assignments.length})</h2>
          <p>
            Simulations converted from syllabus recommendations into active Classmate student assignments with debriefing prompts and objectives.
          </p>
        </div>
        <div className="panel-actions">
          <button type="button" className="secondary" onClick={handleExportAll}>
            <LucideDownload size={16} /> Export All JSON
          </button>
          <button type="button" className="secondary" onClick={onClearAll}>
            Clear List
          </button>
        </div>
      </div>

      <div className="assignments-grid">
        {assignments.map((asm) => (
          <article key={asm.id} className="assignment-card">
            <div className="card-top">
              <div className="status-pill published">
                <LucideCheckCircle2 size={14} /> {asm.status === "published" ? "Published in Classmate" : "Classmate Draft"}
              </div>
              <span className="term-badge">{asm.term}</span>
            </div>

            <h3 className="assignment-title">{asm.title}</h3>
            <p className="module-subtitle">
              Module Topic: <strong>{asm.moduleTitle}</strong>
            </p>

            <div className="meta-row">
              <div>
                <span className="meta-label">Simulation</span>
                <strong>{asm.simName} ({asm.simDifficulty})</strong>
              </div>
              <div>
                <span className="meta-label">Due Date</span>
                <span>
                  <LucideCalendar size={14} style={{ display: "inline", marginRight: 4 }} />
                  {asm.dueDate}
                </span>
              </div>
              <div>
                <span className="meta-label">Points</span>
                <span>
                  <LucideAward size={14} style={{ display: "inline", marginRight: 4 }} />
                  {asm.points} pts
                </span>
              </div>
            </div>

            {asm.objectives && asm.objectives.length > 0 && (
              <div className="objectives-preview">
                <span className="preview-label">
                  <LucideListCheck size={14} /> Objectives ({asm.objectives.length}):
                </span>
                <ul>
                  {asm.objectives.slice(0, 2).map((obj, i) => (
                    <li key={`obj-${i}-${obj}`}>{obj}</li>
                  ))}
                  {asm.objectives.length > 2 && (
                    <li className="more-count">+ {asm.objectives.length - 2} more objectives</li>
                  )}
                </ul>
              </div>
            )}

            <div className="card-bottom-actions">
              <button
                type="button"
                className="secondary btn-sm"
                onClick={() => {
                  alert(`Direct Link to Assignment in ClassmateLR:\nhttps://classmatelr/assignments/${asm.id}`);
                }}
              >
                <LucideExternalLink size={14} /> View in Classmate
              </button>
              <button
                type="button"
                className="secondary btn-sm delete-btn"
                onClick={() => onDeleteAssignment(asm.id)}
                title="Delete assignment"
              >
                <LucideTrash2 size={14} />
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
