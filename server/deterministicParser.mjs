export function deterministicFallbackParse(text) {
  if (!text || typeof text !== "string" || !text.trim()) {
    return {
      institutionName: undefined,
      courseCode: undefined,
      courseTitle: "Extracted Course Content",
      courseDescription: "Modules built via fallback deterministic extraction.",
      learningObjectives: [],
      modules: [],
    };
  }

  // Course code detection & normalization (e.g., RCP206 or RCP 206 -> RCP 206)
  let courseCode;
  const courseCodeMatch = text.match(/\b([A-Z]{2,4})\s*(\d{3})\b/i);
  if (courseCodeMatch) {
    courseCode = `${courseCodeMatch[1].toUpperCase()} ${courseCodeMatch[2]}`;
  }

  // Course title attempt
  let courseTitle;
  const titleMatch = text.match(/(?:Course Title|Course|Syllabus):\s*([^\n\r]+)/i);
  if (titleMatch) {
    courseTitle = titleMatch[1].trim();
  } else if (courseCodeMatch) {
    const codeLine = text.split(/\r?\n/).find((l) => l.includes(courseCodeMatch[0]));
    if (codeLine) {
      const rest = codeLine.replace(courseCodeMatch[0], "").replace(/^[\:\s\-–—]+/, "").trim();
      if (rest.length > 3) courseTitle = rest;
    }
  }

  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  const objectiveVerbRegex = /^(?:[•\-\*]|\d+[\.\)])?\s*(Define|Describe|Explain|Identify|Calculate|Apply|Analyze|Interpret|Evaluate|Demonstrate|Compare|Select|Perform|Outline|List|Discuss|Assess|Manage|Differentiate|Summarize)\b/i;
  const isBulletOrNumbered = /^(?:[•\-\*]|\d+[\.\)])\s*(.+)/;
  
  const assessmentRegex = /\b(midterm|final exam|quiz|review|unit exam|exam \d+)\b/i;
  const headerRegex = /^(unit|chapter|module|week|part|section)\s*(\d+|[ivxldcm]+)[\:\s\-–—]*(.*)/i;

  const modules = [];
  let currentModule = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if line is an assessment-only heading to exclude
    if (assessmentRegex.test(line) && !/learning objectives/i.test(line)) {
      continue;
    }

    const headerMatch = line.match(headerRegex);
    if (headerMatch) {
      const kind = headerMatch[1];
      const num = headerMatch[2];
      const rest = headerMatch[3].trim();

      // Skip assessment headers that might match headerRegex (e.g., "Unit Exam 1")
      if (assessmentRegex.test(rest) || assessmentRegex.test(kind)) {
        continue;
      }

      if (currentModule) {
        modules.push(currentModule);
      }

      const kindCap = kind.charAt(0).toUpperCase() + kind.slice(1).toLowerCase();
      currentModule = {
        courseCode: courseCode || undefined,
        courseTitle: courseTitle || undefined,
        weekOrModule: `${kindCap} ${num}`,
        topic: rest || `${kindCap} ${num}`,
        learningObjectives: [],
        detectedBloomLevel: "Understand",
        clinicalFocus: {
          patientPopulation: [],
          pathologies: [],
          therapies: [],
          equipment: [],
          assessmentData: [],
          skills: [],
          decisionTypes: [],
        },
        topicExposureStatus: "first_introduction",
      };
      continue;
    }

    // Check if line is an objective starting with an action verb or bullet point
    if (objectiveVerbRegex.test(line) || (currentModule && isBulletOrNumbered.test(line))) {
      const cleanObj = line.replace(/^(?:[•\-\*]|\d+[\.\)])\s*/, "").trim();
      if (cleanObj.length > 5) {
        if (!currentModule) {
          currentModule = {
            courseCode: courseCode || undefined,
            courseTitle: courseTitle || undefined,
            weekOrModule: "Module 1",
            topic: "Course Content",
            learningObjectives: [cleanObj],
            detectedBloomLevel: "Understand",
            clinicalFocus: {
              patientPopulation: [],
              pathologies: [],
              therapies: [],
              equipment: [],
              assessmentData: [],
              skills: [],
              decisionTypes: [],
            },
            topicExposureStatus: "first_introduction",
          };
        } else {
          currentModule.learningObjectives.push(cleanObj);
        }
      }
    }
  }

  if (currentModule) {
    modules.push(currentModule);
  }

  // Filter out modules that have 0 objectives and generic topic unless no other modules
  let validModules = modules.filter(
    (m) => m.learningObjectives.length > 0 || (m.topic && m.topic.length > 3)
  );

  if (validModules.length === 0) {
    const fallbackObjectives = lines.length > 0
      ? lines.filter((l) => l.length > 3 && !assessmentRegex.test(l)).slice(0, 20)
      : ["Review course syllabus curriculum, clinical decision-making, and simulation scenarios."];

    validModules.push({
      courseCode: courseCode || undefined,
      courseTitle: courseTitle || "Extracted Course Content",
      weekOrModule: "Module 1",
      topic: "Course Content & Clinical Topics",
      learningObjectives: fallbackObjectives.length > 0 ? fallbackObjectives : ["Review course syllabus curriculum and clinical topics."],
      detectedBloomLevel: "Understand",
      clinicalFocus: {
        patientPopulation: [],
        pathologies: [],
        therapies: [],
        equipment: [],
        assessmentData: [],
        skills: [],
        decisionTypes: [],
      },
      topicExposureStatus: "first_introduction",
    });
  }

  return {
    institutionName: undefined,
    courseCode: courseCode || undefined,
    courseTitle: courseTitle || "Extracted Course Content",
    courseDescription: "Modules built via fallback deterministic extraction.",
    learningObjectives: [],
    modules: validModules,
  };
}
