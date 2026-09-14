import { ParsedSyllabusModule, ProgramTerm } from "../types";

type TermAssignment = {
  term: ProgramTerm;
  source: "course_code" | "filename" | "content_inference";
  confidence: "high" | "medium" | "low";
  reason: string;
};

export function inferProgramTermFromParsedSyllabus(
  modules: ParsedSyllabusModule[],
  filename: string,
  courseCode?: string
): TermAssignment {
  // 1. Check for specific demo mappings
  const demoMappings: Record<string, { term: ProgramTerm, regex: RegExp }> = {
    "RT 222": { term: "Term 1", regex: /(?:RT|RCP|RESP|RC|RRT)[\s-_]*222/i },
    "RT 252": { term: "Term 2", regex: /(?:RT|RCP|RESP|RC|RRT)[\s-_]*252/i },
    "RT 303": { term: "Term 3", regex: /(?:RT|RCP|RESP|RC|RRT)[\s-_]*303/i },
    "RT 385": { term: "Term 5", regex: /(?:RT|RCP|RESP|RC|RRT)[\s-_]*385/i },
  };

  for (const [demoCode, { term, regex }] of Object.entries(demoMappings)) {
    if (
      (courseCode && regex.test(courseCode)) ||
      regex.test(filename)
    ) {
      return {
        term,
        source: courseCode && regex.test(courseCode) ? "course_code" : "filename",
        confidence: "high",
        reason: `Matched known demo course mapping: ${demoCode}`,
      };
    }
  }

  // 2. Try to extract course code number from courseCode or filename (matches RC, RT, RCP, RESP, RRT, etc.)
  const courseCodeMatch = (courseCode || "").match(/(?:[A-Za-z]{2,4})?[\s-_]*([1-5]\d{2})/i) ||
                          filename.match(/(?:[A-Za-z]{2,4})?[\s-_]*([1-5]\d{2})/i);

  if (courseCodeMatch) {
    const courseNum = parseInt(courseCodeMatch[1], 10);
    let term: ProgramTerm | undefined;
    if (courseNum >= 100 && courseNum <= 199) term = "Term 1";
    else if (courseNum >= 200 && courseNum <= 299) term = "Term 2";
    else if (courseNum >= 300 && courseNum <= 329) term = "Term 3";
    else if (courseNum >= 330 && courseNum <= 379) term = "Term 4";
    else if (courseNum >= 380) term = "Term 5";

    if (term) {
      const source = courseCode && courseCode.match(/(?:[A-Za-z]{2,4})?[\s-_]*([1-5]\d{2})/i) ? "course_code" : "filename";
      const reason = `Extracted course number ${courseNum} from ${source === "course_code" ? "course code" : "filename"}.`;
      return { term, source, confidence: "high", reason };
    }
  }

  // 3. Infer from content using ClassmateLR five-term training philosophy
  const scores = {
    "Term 1": 0,
    "Term 2": 0,
    "Term 3": 0,
    "Term 4": 0,
    "Term 5": 0,
  };

  const term1Keywords = ["basic", "foundation", "oxygen", "aerosol", "medication", "vital sign", "breath sound", "introductory"];
  const term2Keywords = ["physical assessment", "bronchial hygiene", "lung expansion", "abg", "ecg", "chest imaging", "care plan", "electrocardiogram", "x-ray"];
  const term3Keywords = ["mechanical ventilation", "ventilator", "capnography", "monitoring", "adult acute", "troubleshooting"];
  const term4Keywords = ["critical care", "icu", "hemodynamics", "neonatal", "pediatric", "multi-system", "high-risk", "advanced"];
  const term5Keywords = ["nbrc", "cse", "tmc", "credentialing", "mastery", "exit", "board", "comprehensive"];

  for (const mod of modules) {
    const content = [
      mod.topic,
      ...(mod.learningObjectives || []),
      ...(mod.clinicalFocus?.pathologies || []),
      ...(mod.clinicalFocus?.therapies || []),
      ...(mod.clinicalFocus?.skills || [])
    ].join(" ").toLowerCase();

    // Score Term 1
    term1Keywords.forEach(kw => { if (content.includes(kw)) scores["Term 1"] += 1; });
    if (mod.detectedBloomLevel === "Remember" || mod.detectedBloomLevel === "Understand") scores["Term 1"] += 1;

    // Score Term 2
    term2Keywords.forEach(kw => { if (content.includes(kw)) scores["Term 2"] += 1; });
    if (mod.detectedBloomLevel === "Apply") scores["Term 2"] += 1;

    // Score Term 3
    term3Keywords.forEach(kw => { if (content.includes(kw)) scores["Term 3"] += 1; });
    if (mod.detectedBloomLevel === "Analyze") scores["Term 3"] += 0.5;

    // Score Term 4
    term4Keywords.forEach(kw => { if (content.includes(kw)) scores["Term 4"] += 1; });
    if (mod.detectedBloomLevel === "Evaluate") scores["Term 4"] += 0.5;

    // Score Term 5
    term5Keywords.forEach(kw => { if (content.includes(kw)) scores["Term 5"] += 1; });
    if (mod.detectedBloomLevel === "Create" || mod.detectedBloomLevel === "Evaluate") scores["Term 5"] += 0.5;
  }

  let highestScore = -1;
  let bestTerm: ProgramTerm = "Term 1"; // Fallback

  for (const [term, score] of Object.entries(scores)) {
    if (score > highestScore) {
      highestScore = score;
      bestTerm = term as ProgramTerm;
    }
  }

  // Determine confidence
  let confidence: "high" | "medium" | "low" = "low";
  if (highestScore > 10) confidence = "high";
  else if (highestScore > 4) confidence = "medium";

  const reason = `Content analysis aligned best with ${bestTerm} (score: ${highestScore}).`;

  return { term: bestTerm, source: "content_inference", confidence, reason };
}
