const curriculumMarkers = [
  /course\s+(?:title|description|objectives?)/i,
  /learning\s+outcomes?/i,
  /weekly\s+(?:schedule|outline|topics?)/i,
  /(?:RTP|RCP|RESP|RRT|RT)\s*[-_]?\s*\d{3,4}/i,
];

export function hasUsefulExtractedText(value) {
  const text = typeof value === "string" ? value : "";
  const words = text.match(/[A-Za-z0-9][A-Za-z0-9'/-]*/g) || [];
  const letters = (text.match(/[A-Za-z]/g) || []).length;
  const markerCount = curriculumMarkers.filter((marker) => marker.test(text)).length;
  return letters >= 500 && words.length >= 100 && markerCount >= 1;
}

export function assessParsedSyllabus(parsed, options = {}) {
  const modules = Array.isArray(parsed?.modules) ? parsed.modules : [];
  const sourceText = typeof options.sourceText === "string" ? options.sourceText : "";
  const usedInlineDocument = options.usedInlineDocument === true;
  const hasIdentity = Boolean(parsed?.courseCode || parsed?.courseTitle || parsed?.institutionName);
  const meaningfulModules = modules.filter((module) => {
    const topic = typeof module?.topic === "string" ? module.topic.trim() : "";
    const objectives = Array.isArray(module?.learningObjectives)
      ? module.learningObjectives.filter((item) => typeof item === "string" && item.trim().length >= 8)
      : [];
    const focus = module?.clinicalFocus && typeof module.clinicalFocus === "object"
      ? Object.values(module.clinicalFocus).flat().filter(Boolean)
      : [];
    return topic.length >= 8 && (objectives.length > 0 || focus.length >= 2);
  });

  if (meaningfulModules.length === 0) {
    return { valid: false, confidence: "low", reason: "No evidence-based curriculum modules were extracted." };
  }
  if (!usedInlineDocument && !hasUsefulExtractedText(sourceText)) {
    return { valid: false, confidence: "low", reason: "The source did not contain enough readable syllabus text." };
  }
  if (!hasIdentity && meaningfulModules.length < 2) {
    return { valid: false, confidence: "low", reason: "Course identity and sufficient module evidence were not found." };
  }

  const confidence = hasIdentity && meaningfulModules.length >= 3 ? "high" : "medium";
  return { valid: true, confidence, reason: `${meaningfulModules.length} evidence-based curriculum module(s) extracted.` };
}
