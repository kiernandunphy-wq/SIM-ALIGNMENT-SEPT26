const courseHeading = /\b(RTP\s*\d{4})\s*(?:(?:Lecture|Laboratory|Clinical)\s*)?Course\s+Syllabus/gi;

export function splitCourseSyllabusSections(text) {
  if (typeof text !== "string" || !text.trim()) return [];
  const transitions = [];
  let previousCode = "";
  for (const match of text.matchAll(courseHeading)) {
    const courseCode = match[1].replace(/\s+/g, "").toUpperCase();
    if (courseCode !== previousCode) {
      transitions.push({ courseCode, index: match.index || 0 });
      previousCode = courseCode;
    }
  }
  return transitions.map((transition, index) => ({
    courseCode: transition.courseCode,
    text: text.slice(transition.index, transitions[index + 1]?.index ?? text.length).trim(),
  })).filter((section) => section.text.length > 0);
}
