import { jsPDF } from "jspdf";

export function generateCodebaseDocumentationPdf() {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;

  let y = margin;

  // Helper: Header bar
  function drawHeader(title: string) {
    doc.setFillColor(30, 41, 59); // Slate 800
    doc.rect(0, 0, pageWidth, 12, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(9);
    doc.text("ClassmateLR Alignment System Manual", margin, 8);
    
    doc.setFont("Helvetica", "normal");
    doc.setTextColor(148, 163, 184); // Slate 400
    doc.text(title, pageWidth - margin - doc.getTextWidth(title), 8);
  }

  // Helper: Footer
  function drawFooter(pageNumber: number) {
    doc.setFillColor(248, 250, 252); // Slate 50
    doc.rect(0, pageHeight - 12, pageWidth, 12, "F");
    
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139); // Slate 500
    doc.text("Faculty Decision-Support Documentation • Executive Summary", margin, pageHeight - 4.5);
    
    const pageStr = `Page ${pageNumber} of 2`;
    doc.text(pageStr, pageWidth - margin - doc.getTextWidth(pageStr), pageHeight - 4.5);
  }

  // Helper: Section Title
  function drawSectionTitle(title: string) {
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42); // Slate 900
    doc.text(title, margin, y);
    y += 3;
    doc.setDrawColor(226, 232, 240); // Slate 200
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;
  }

  // Helper: Subsection Title
  function drawSubsectionTitle(title: string) {
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59); // Slate 800
    doc.text(title, margin, y);
    y += 4.5;
  }

  // ==================== PAGE 1: SYSTEM OVERVIEW & FILE MANIFEST ====================
  // Header block
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(0, 0, pageWidth, 42, "F");

  doc.setFillColor(14, 165, 233); // Sky 500
  doc.rect(margin, 10, 15, 2, "F");

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text("ClassmateLR Alignment System Manual", margin, 20);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184); // Slate 400
  doc.text("Technical Codebase Documentation & Decision Tree Architecture (1-2 Page Executive Summary)", margin, 27);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225); // Slate 300
  doc.text(`Generated: ${new Date().toLocaleDateString()} | Scope: Full-Stack Integration & AI Extractors | Security: Server-Side Secret Key Guarding`, margin, 35);

  y = 48;

  drawSectionTitle("1. Repository Architecture & Key Files");

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);

  const manifestItems = [
    { title: "server/geminiProxy.mjs (Main Backend Service & Fail-Safe Parser)", desc: "Extracts PDF/Word text via pdf-parse & mammoth. Proxies Gemini 2.5-Flash calls with strict JSON schema. Features deterministic text fallback if AI output is empty." },
    { title: "server/dev.mjs (Dev Server & Express Integration)", desc: "Mounts Vite middleware for development hot-reloading and routes endpoints (/api/parse-syllabus)." },
    { title: "src/App.tsx (Primary Dashboard UI & Executive Report Generator)", desc: "Manages syllabus upload state, program term assignment dropdowns, processing progress modal, and 1-2 page HTML/PDF report builder." },
    { title: "src/services/decisionEngine.ts (Simulation Alignment Algorithm)", desc: "Implements 5-term progressive rules matrix, weighted scoring math (focus, objectives, equipment, Bloom level), and topic-specific score boosts." },
    { title: "src/utils/termInference.ts (Predictive Program Term Inference)", desc: "Auto-assigns syllabi to Terms 1-5 using regular expressions (e.g. RT303 -> Term 3) and body text heuristics with confidence metrics." },
    { title: "src/types.ts & src/utils/text.ts (Shared Data Schemas & Formatting)", desc: "Defines TS interfaces for syllabi, simulation pools, and course code formatters (e.g., RCP-203)." }
  ];

  manifestItems.forEach((item) => {
    drawSubsectionTitle(item.title);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    const lines = doc.splitTextToSize(`• ${item.desc}`, contentWidth - 4);
    lines.forEach((line: string) => {
      doc.text(line, margin + 2, y);
      y += 4;
    });
    y += 2.5;
  });

  drawFooter(1);


  // ==================== PAGE 2: DECISION TREE & FALLBACK SCHEMATIC ====================
  doc.addPage();
  drawHeader("Alignment Decision Tree Map");
  y = 18;

  drawSectionTitle("2. Simulation-Syllabus Alignment Decision Tree");

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text("Sequential rule engine that validates and ranks simulations against course syllabus modules:", margin, y);
  y += 6;

  const stepHeight = 10;
  const stepGap = 4;
  const boxWidth = contentWidth;
  const boxX = margin;

  const steps = [
    { num: "Step 1", title: "Term Rules Validation", desc: "Checks Term match (1-5). Blocks invalid difficulty tiers (e.g., intermediate/advanced blocked in Term 1)." },
    { num: "Step 2", title: "Topic Exposure Check", desc: "Validates module topicExposureStatus (Initial vs. Review/Reinforcement) against term eligibility rules." },
    { num: "Step 3", title: "Weighted Overlap Scoring", desc: "Calculates match score: clinical focus (+10), objectives (+9), equipment (+8), pathology (+10), Bloom level (+10)." },
    { num: "Step 4", title: "Meaningful Topic Filter", desc: "Scans diagnostic key phrases (abg, ventilat, hemodyn). Zeroes scores lacking key topics if score < 30." },
    { num: "Step 5", title: "Topic-Specific Boosts", desc: "Applies targeted domain bonuses: +25 for ABG, +20 for Gas Exchange, +25 for Hemodynamics, +20 for CXR/Imaging." },
    { num: "Step 6", title: "Recommendation & Near-Matches Rank", desc: "Ranks top-scoring simulations as recommended. Blocks and lower-scoring candidates move to Rejected Near-Matches." }
  ];

  steps.forEach((step, index) => {
    doc.setFillColor(241, 245, 249); // Slate 100
    doc.rect(boxX, y, boxWidth, stepHeight, "F");
    
    doc.setFillColor(14, 165, 233); // Sky 500
    doc.rect(boxX, y, 2, stepHeight, "F");

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(`${step.num}: ${step.title}`, boxX + 4, y + 4);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(step.desc, boxX + 4, y + 8);

    y += stepHeight;

    if (index < steps.length - 1) {
      doc.setDrawColor(203, 213, 225);
      doc.line(boxX + boxWidth / 2, y, boxX + boxWidth / 2, y + stepGap);
      y += stepGap;
    }
  });

  y += 8;

  // Fallback Rule Summary Box
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(margin, y, contentWidth, 30, "F");

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(14, 165, 233); // Sky 500
  doc.text("DETERMINISTIC FALLBACK TRIGGER MECHANISM", margin + 6, y + 6);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(241, 245, 249);
  
  const fallbackRules = [
    "• Target Condition: Triggered if Gemini returns empty JSON or fails structured extraction.",
    "• Heuristic Extractor: Parses syllabus text matching headers (Course Content, Weekly Outline, Learning Objectives).",
    "• Safe Output Strategy: Returns structured modules with parserSource = 'deterministic_text_fallback'.",
    "• Faculty Guidance: Prompts faculty review flag without halting application analysis or report generation."
  ];

  let fallbackY = y + 11;
  fallbackRules.forEach(line => {
    doc.text(line, margin + 6, fallbackY);
    fallbackY += 4.5;
  });

  drawFooter(2);

  doc.save(`classmatelr-system-documentation-${new Date().toISOString().slice(0, 10)}.pdf`);
}
