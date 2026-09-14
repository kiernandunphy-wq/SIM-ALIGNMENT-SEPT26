import test from "node:test";
import assert from "node:assert/strict";
import { assessParsedSyllabus, hasUsefulExtractedText } from "./parseQuality.mjs";

test("image-only PDF control text is not treated as useful syllabus text", () => {
  assert.equal(hasUsefulExtractedText("\f\n\f\nQ8.pdf\n\f"), false);
});

test("filename-only fallback cannot pass curriculum quality checks", () => {
  const parsed = {
    courseTitle: "Q8.pdf",
    modules: [{
      weekOrModule: "Module 1",
      topic: "Course Content",
      learningObjectives: ["Review course syllabus curriculum and clinical topics."],
      clinicalFocus: {},
    }],
  };
  const quality = assessParsedSyllabus(parsed, { sourceText: "Course Syllabus: Q8.pdf" });
  assert.equal(quality.valid, false);
  assert.equal(quality.confidence, "low");
});

test("substantive searchable syllabus text and modules pass quality checks", () => {
  const sourceText = `${"Course Title: Mechanical Ventilation\nCourse objectives and weekly schedule\n".repeat(20)}RTP 1600`;
  const parsed = {
    courseCode: "RTP1600",
    courseTitle: "Mechanical Ventilation and Airway Management",
    modules: [1, 2, 3].map((number) => ({
      weekOrModule: `Week ${number}`,
      topic: "Ventilator initiation and patient stabilization",
      learningObjectives: ["Select initial settings and evaluate the patient's response."],
      clinicalFocus: { skills: ["ventilator setup", "ABG interpretation"] },
    })),
  };
  const quality = assessParsedSyllabus(parsed, { sourceText });
  assert.equal(quality.valid, true);
  assert.equal(quality.confidence, "high");
});
