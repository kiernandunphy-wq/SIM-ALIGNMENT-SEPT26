import React, { useEffect, useState } from "react";
import { Lottie } from "lottie-react";
import { LucideFileText, LucideBrain, LucideCheckCircle2, LucideLayers, LucideAlertCircle, LucideShieldCheck } from "lucide-react";
import processingAnimation from "../assets/processing-lottie.json";

interface ProcessingModalProps {
  isOpen: boolean;
  currentFileName?: string;
  currentIndex: number;
  totalFiles: number;
  message?: string;
}

export function ProcessingModal({
  isOpen,
  currentFileName,
  currentIndex,
  totalFiles,
  message,
}: ProcessingModalProps) {
  const [stage, setStage] = useState<number>(1);
  const [backdropFlash, setBackdropFlash] = useState<boolean>(false);

  // Simulate progress stages for visual feedback during parsing
  useEffect(() => {
    if (!isOpen) {
      setStage(1);
      return;
    }

    const interval = setInterval(() => {
      setStage((prev) => (prev < 4 ? prev + 1 : prev));
    }, 1200);

    return () => clearInterval(interval);
  }, [isOpen, currentIndex]);

  if (!isOpen) return null;

  const progressPercent = totalFiles > 0 ? Math.min(Math.round((currentIndex / totalFiles) * 100), 99) : 5;

  const stages = [
    {
      id: 1,
      title: "Document Ingestion & Text Extraction",
      desc: "Parsing PDF structure, course headings, and syllabus modules...",
      icon: LucideFileText,
    },
    {
      id: 2,
      title: "Gemini AI Curriculum Analysis",
      desc: "Extracting clinical pathologies, Bloom's taxonomy, and learning objectives...",
      icon: LucideBrain,
    },
    {
      id: 3,
      title: "Five-Term Philosophy Alignment",
      desc: "Applying ClassmateLR term rules and cognitive progression filters...",
      icon: LucideLayers,
    },
    {
      id: 4,
      title: "Simulation Catalog Scoring & Debrief Prep",
      desc: "Calculating match scores, generating debrief questions, and rationale...",
      icon: LucideShieldCheck,
    },
  ];

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Static backdrop behavior - clicking outside flashes warning that process cannot be dismissed
    if (e.target === e.currentTarget) {
      setBackdropFlash(true);
      setTimeout(() => setBackdropFlash(false), 800);
    }
  };

  return (
    <div
      className={`processing-backdrop ${backdropFlash ? "flash-backdrop" : ""}`}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="processing-modal-title"
    >
      <div className="processing-modal-card">
        {/* Header Header */}
        <div className="processing-modal-header">
          <div className="processing-lottie" aria-hidden="true">
            <Lottie src={processingAnimation} loop autoplay />
          </div>
          <div>
            <h3 id="processing-modal-title">Processing Syllabus Content</h3>
            <p className="modal-subtitle">
              ClassmateLR AI is analyzing your syllabus and generating simulation recommendations
            </p>
          </div>
        </div>

        {/* Current File Information */}
        <div className="current-file-badge">
          <LucideFileText size={18} className="file-icon" />
          <div className="file-info-text">
            <span className="file-label">Currently Processing ({currentIndex + 1} of {totalFiles}):</span>
            <strong className="file-name">{currentFileName || "Syllabus document..."}</strong>
          </div>
        </div>

        {/* Static Progress Bar */}
        <div className="progress-section">
          <div className="progress-meta">
            <span>Overall Alignment Progress</span>
            <span className="progress-percent">{progressPercent}%</span>
          </div>
          <div className="progress-bar-track">
            <div
              className="progress-bar-fill"
              style={{ width: `${Math.max(progressPercent, 12)}%` }}
            />
          </div>
        </div>

        {/* Stage Steps List */}
        <div className="stages-list">
          {stages.map((s) => {
            const Icon = s.icon;
            const isDone = s.id < stage;
            const isCurrent = s.id === stage;
            return (
              <div
                key={s.id}
                className={`stage-row ${isDone ? "done" : ""} ${isCurrent ? "active" : ""}`}
              >
                <div className="stage-icon-wrap">
                  {isDone ? (
                    <LucideCheckCircle2 className="check-icon" size={20} />
                  ) : isCurrent ? (
                    <div className="stage-spinner" />
                  ) : (
                    <Icon className="idle-icon" size={18} />
                  )}
                </div>
                <div className="stage-text">
                  <div className="stage-title">{s.title}</div>
                  <div className="stage-desc">{s.desc}</div>
                </div>
                {isCurrent && <span className="status-pill active-pill">In Progress</span>}
                {isDone && <span className="status-pill done-pill">Completed</span>}
              </div>
            );
          })}
        </div>

        {/* Static Backdrop Warning Notice */}
        <div className="processing-notice">
          <LucideAlertCircle size={18} className="notice-icon" />
          <span>
            {backdropFlash ? (
              <strong style={{ color: "#d97706" }}>
                Analysis is actively in progress. This window will close automatically when complete.
              </strong>
            ) : (
              <>
                <strong>Static Backdrop Notice:</strong> Please do not close or refresh this tab while Gemini processes your syllabus and aligns simulations.
              </>
            )}
          </span>
        </div>

        {message && <div className="status-message-box">{message}</div>}
      </div>
    </div>
  );
}
