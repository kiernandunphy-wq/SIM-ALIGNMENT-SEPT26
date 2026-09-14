import test from "node:test";
import assert from "node:assert/strict";
import { splitCourseSyllabusSections } from "./courseSections.mjs";

test("quarter bundles split when the RTP course code changes, not on repeated page headers", () => {
  const text = [
    "RTP1010 Lecture Course Syllabus\nCourse: RTP1010\nAssessment and oxygen therapy",
    "RTP1010 Lecture Course Syllabus\nWeekly schedule continued",
    "RTP1020 Lecture Course Syllabus\nCourse: RTP1020\nLaboratory competencies",
    "RTP1020 Lecture Course Syllabus\nWeekly schedule continued",
    "RTP1200Lecture Course Syllabus\nCourse: RTP1200\nPharmacology",
  ].join("\n");
  const sections = splitCourseSyllabusSections(text);
  assert.deepEqual(sections.map((section) => section.courseCode), ["RTP1010", "RTP1020", "RTP1200"]);
  assert.match(sections[0].text, /Weekly schedule continued/);
});
