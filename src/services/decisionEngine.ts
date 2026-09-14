import { simCatalog } from "../data/simCatalog";
import type {
  AlignmentStatus,
  DebriefQuestions,
  ParsedSyllabusModule,
  ProgramTermAlignment,
  ProgramTerm,
  SimRecommendationResult,
  SimulationCatalogItem,
  SimulationDifficulty,
  TermRule,
  UploadedSyllabus,
} from "../types";
import { countTermOverlap, normalizeText, uniqueStrings } from "../utils/text";

const termRules: Record<ProgramTerm, TermRule> = {
  "Term 1": {
    term: "Term 1",
    label: "Basic Simulation Exposure",
    assignedTier: "Basic",
    allowedPrimaryDifficulties: ["Basic"],
    allowedReviewDifficulties: [],
    blockedDifficulties: ["Intermediate", "Advanced", "NBRC", "Variable"],
  },
  "Term 2": {
    term: "Term 2",
    label: "Basic to Intermediate Diagnostic Integration",
    assignedTier: "Basic / Intermediate",
    allowedPrimaryDifficulties: ["Basic", "Intermediate"],
    allowedReviewDifficulties: ["Basic"],
    blockedDifficulties: ["Advanced", "NBRC", "Variable"],
  },
  "Term 3": {
    term: "Term 3",
    label: "Ventilator-Focused Advanced Clinical Decision Making",
    assignedTier: "Intermediate with ventilator-focused clinical decision-making",
    allowedPrimaryDifficulties: ["Intermediate"],
    allowedReviewDifficulties: ["Basic"],
    blockedDifficulties: ["Advanced", "NBRC", "Variable"],
  },
  "Term 4": {
    term: "Term 4",
    label: "Critical Care + Neonatal/Pediatric Advanced Integration",
    assignedTier: "Advanced integration",
    allowedPrimaryDifficulties: ["Advanced"],
    allowedReviewDifficulties: ["Basic", "Intermediate"],
    blockedDifficulties: ["NBRC", "Variable"],
  },
  "Term 5": {
    term: "Term 5",
    label: "NBRC-Level Simulation Mastery and Credentialing Readiness",
    assignedTier: "NBRC / Variable / Credentialing readiness",
    allowedPrimaryDifficulties: ["NBRC", "Variable", "Advanced"],
    allowedReviewDifficulties: ["Basic", "Intermediate"],
    blockedDifficulties: [],
  },
};

const bridgeExposureStatuses = new Set(["review_reinforcement", "builds_on_prior_sim", "remediation"]);
const term4LowerTierExposureStatuses = new Set([
  "first_introduction",
  "review_reinforcement",
  "builds_on_prior_sim",
  "remediation",
]);
const term5LowerTierExposureStatuses = new Set(["review_reinforcement", "builds_on_prior_sim", "remediation"]);

export function getTermRules(term: ProgramTerm): TermRule {
  return termRules[term];
}

export function getAssignedDifficultyTier(term: ProgramTerm): string {
  return getTermRules(term).assignedTier;
}

export function getAllowedDifficulties(term: ProgramTerm): SimulationDifficulty[] {
  const rule = getTermRules(term);
  return uniqueStrings([
    ...rule.allowedPrimaryDifficulties,
    ...rule.allowedReviewDifficulties,
  ]) as SimulationDifficulty[];
}

export function isDifficultyAllowed(
  sim: SimulationCatalogItem,
  term: ProgramTerm,
  module: ParsedSyllabusModule,
  allowAdvancedInTerm3 = false,
): boolean {
  const rule = getTermRules(term);
  if (term === "Term 3" && sim.difficulty === "Advanced" && allowAdvancedInTerm3) {
    return true;
  }
  if (rule.blockedDifficulties.includes(sim.difficulty)) {
    return false;
  }
  if (sim.endOfProgramOnly && term !== "Term 5") {
    return false;
  }
  if ((sim.difficulty === "NBRC" || sim.difficulty === "Variable") && term !== "Term 5") {
    return false;
  }
  if (sim.difficulty === "Advanced" && !["Term 4", "Term 5"].includes(term)) {
    return false;
  }
  if (sim.difficulty === "Intermediate" && term === "Term 1") {
    return false;
  }
  if (rule.allowedPrimaryDifficulties.includes(sim.difficulty)) {
    return true;
  }
  if (!rule.allowedReviewDifficulties.includes(sim.difficulty)) {
    return false;
  }
  if (term === "Term 3") {
    return bridgeExposureStatuses.has(module.topicExposureStatus);
  }
  if (term === "Term 4") {
    return term4LowerTierExposureStatuses.has(module.topicExposureStatus);
  }
  if (term === "Term 5") {
    return term5LowerTierExposureStatuses.has(module.topicExposureStatus);
  }
  return true;
}

export function getClinicalFocusTerms(module: ParsedSyllabusModule): string[] {
  return uniqueStrings([
    module.topic,
    ...module.learningObjectives,
    ...module.clinicalFocus.patientPopulation,
    ...module.clinicalFocus.pathologies,
    ...module.clinicalFocus.therapies,
    ...module.clinicalFocus.equipment,
    ...module.clinicalFocus.assessmentData,
    ...module.clinicalFocus.skills,
    ...module.clinicalFocus.decisionTypes,
  ]);
}

export function hasClinicalOverlap(module: ParsedSyllabusModule, sim: SimulationCatalogItem): boolean {
  const moduleTerms = getClinicalFocusTerms(module);
  const simTerms = [...sim.clinicalFocus, ...sim.pathologies, ...sim.content, ...sim.skills];
  return countTermOverlap(moduleTerms, simTerms) > 0;
}

const meaningfulKeywords = [
  "abg", "oxygen", "airway", "artificial airway", "tracheostomy", "ventilat",
  "gas exchange", "acid-base", "capnography", "hemodynamic", "radiograph",
  "copd", "asthma", "pneumonia", "ards", "pulmonary embolism", "neonatal", "pediatric", "critical care"
];

export function scoreSim(
  module: ParsedSyllabusModule,
  sim: SimulationCatalogItem,
  term: ProgramTerm,
  allowAdvancedInTerm3 = false,
): number {
  if (!isDifficultyAllowed(sim, term, module, allowAdvancedInTerm3)) {
    return 0;
  }

  const moduleClinicalTerms = getClinicalFocusTerms(module);
  const topicObjectiveTerms = [module.topic, ...module.learningObjectives];
  const moduleContentSkillTerms = [
    ...module.clinicalFocus.therapies,
    ...module.clinicalFocus.equipment,
    ...module.clinicalFocus.assessmentData,
    ...module.clinicalFocus.skills,
    ...module.clinicalFocus.decisionTypes,
  ];

  const clinicalMatches = countTermOverlap(moduleClinicalTerms, sim.clinicalFocus);
  const objectiveMatches = countTermOverlap(topicObjectiveTerms, [...sim.content, ...sim.clinicalFocus]);
  const contentSkillMatches = countTermOverlap(moduleContentSkillTerms, [...sim.content, ...sim.skills]);
  const pathologyMatches = countTermOverlap(module.clinicalFocus.pathologies, sim.pathologies);
  const debriefMatches = countTermOverlap(moduleClinicalTerms, sim.debriefFocus);

  let rawScore = (
    Math.min(30, clinicalMatches * 10) +
    Math.min(25, objectiveMatches * 9) +
    Math.min(20, contentSkillMatches * 8) +
    (sim.bloomTargets.includes(module.detectedBloomLevel) ? 10 : 0) +
    Math.min(10, pathologyMatches * 10) +
    Math.min(5, debriefMatches * 3) +
    difficultyTierBonus(sim, term, module)
  );

  // Require meaningful overlap to avoid generic recommendations
  const allModuleText = topicObjectiveTerms.join(" ").toLowerCase();
  const allSimText = [sim.name, ...sim.content, ...sim.clinicalFocus, ...sim.pathologies, ...sim.skills].join(" ").toLowerCase();
  const hasMeaningfulTopic = meaningfulKeywords.some(kw => allModuleText.includes(kw));

  if (!hasMeaningfulTopic && rawScore < 30) {
    return 0;
  }

  if (allModuleText.includes("gas exchange") || allModuleText.includes("oxygen transport")) {
    if (allSimText.includes("oxygenation") || allSimText.includes("ventilation") || allSimText.includes("abg") || allSimText.includes("gas exchange")) {
      rawScore += 20;
    }
  }
  if (allModuleText.includes("abg") || allModuleText.includes("acid-base")) {
    if (allSimText.includes("abg") || allSimText.includes("acid-base")) {
      rawScore += 25;
    }
  }
  if (allModuleText.includes("hemodynamic") || allModuleText.includes("pressure") || allModuleText.includes("volume")) {
    if (allSimText.includes("hemodynamic") || allSimText.includes("cardiopulmonary") || allSimText.includes("monitoring")) {
      rawScore += 25;
    } else {
      rawScore -= 15; // penalize non-hemodynamic sims for hemodynamic modules
    }
  }
  if (allModuleText.includes("chest radiograph") || allModuleText.includes("imaging") || allModuleText.includes("mri") || allModuleText.includes("laboratory")) {
    if (allSimText.includes("pneumonia") || allSimText.includes("embolism") || allSimText.includes("copd") || allSimText.includes("ards") || allSimText.includes("radiograph") || allSimText.includes("x-ray")) {
      rawScore += 20;
    }
  }

  return rawScore;
}

export function assignSims(
  parsedModules: ParsedSyllabusModule[],
  assignedProgramTerm: ProgramTerm,
  catalog: SimulationCatalogItem[] = simCatalog,
  allowAdvancedInTerm3 = false,
): SimRecommendationResult[] {
  const term = assignedProgramTerm;
  const rule = getTermRules(term);

  if (!parsedModules.length) {
    return [
      {
        term,
        termLabel: rule.label,
        weekOrModule: "Unparsed",
        topic: "Parsed data was insufficient",
        learningObjectives: [],
        detectedBloomLevel: "Understand",
        clinicalFocusSummary: [],
        topicExposureStatus: "first_introduction",
        assignedDifficultyTier: rule.assignedTier,
        allowedDifficulties: getAllowedDifficulties(term),
        alignmentStatus: "Needs faculty review",
        alignmentNote: "The course or module data could not be parsed cleanly.",
        appropriateSimPool: [],
        recommendedSims: [],
        rejectedNearMatches: buildRejectedSims(term, fallbackInsufficientModule(), true, catalog, allowAdvancedInTerm3),
      },
    ];
  }

  return parsedModules.map((module) => {
    const moduleTerm = term;
    const moduleRule = getTermRules(moduleTerm);
    const scored = catalog
      .filter((sim) => isDifficultyAllowed(sim, moduleTerm, module, allowAdvancedInTerm3))
      .map((sim) => {
        let score = scoreSim(module, sim, moduleTerm, allowAdvancedInTerm3);
        const sharedMatch = sharedMatchSummary(module, sim);
        if (sharedMatch === "general respiratory care decision making") {
          score = Math.min(score, 40);
        }
        return { sim, score, sharedMatch };
      })
      .filter(({ score }) => score >= 20)
      .sort((a, b) => b.score - a.score);

    const appropriateSimPool = scored.slice(0, 6).map(({ sim, score, sharedMatch }) => ({
      id: sim.id,
      name: sim.name,
      difficulty: sim.difficulty,
      score,
      whyAppropriate: `${sim.difficulty} sim with overlap in ${sharedMatch}.${getTermRules(moduleTerm).allowedReviewDifficulties.includes(sim.difficulty) ? " Lower-tier use is allowed here only when the term rules support review, remediation, first exposure, or bridge work." : ""}`,
    }));

    const recommendedSims = scored.slice(0, 2).map(({ sim, score, sharedMatch }, index) => ({
      id: sim.id,
      name: sim.name,
      difficulty: sim.difficulty,
      score,
      rationale: `${sim.name} matches ${sharedMatch} for ${module.topic}.`,
      bloomAlignment: sim.bloomTargets.includes(module.detectedBloomLevel)
        ? `Direct Bloom fit: ${module.detectedBloomLevel}.`
        : `Closest Bloom fit: module is ${module.detectedBloomLevel}; sim targets ${sim.bloomTargets.join(", ")}.`,
      readinessAlignment: `${sim.difficulty} is allowed in ${moduleTerm} under ${moduleRule.label}.`,
      instructorUseNote: index === 0 ? "Best first pick for this module." : "Secondary option or small-group comparison case.",
      not100PercentAlignmentNote: getReadinessWarning(moduleTerm, module, sim, score),
      debriefQuestions: generateDebriefQuestions(module, sim),
    }));

    let status = getAlignmentStatus(scored[0]?.score ?? 0, recommendedSims[0]?.not100PercentAlignmentNote);
    let alignmentNote = buildAlignmentNote(status, module, scored[0]?.sim, moduleTerm);
    
    if (scored[0]?.sharedMatch === "general respiratory care decision making") {
      status = "Needs faculty review";
      alignmentNote = "Broad overlap found, but lacks specific clinical concept matches. Faculty should review and map manually.";
    }

    if (recommendedSims.length === 0) {
      status = "Needs faculty review";
      alignmentNote = "Curriculum topic was parsed, but no strong simulation match was found.";
    }

    return {
      term: moduleTerm,
      termLabel: moduleRule.label,
      courseCode: module.courseCode,
      weekOrModule: module.weekOrModule,
      topic: module.topic,
      learningObjectives: module.learningObjectives,
      detectedBloomLevel: module.detectedBloomLevel,
      clinicalFocusSummary: getClinicalFocusTerms(module).slice(0, 12),
      topicExposureStatus: module.topicExposureStatus,
      assignedDifficultyTier: moduleRule.assignedTier,
      allowedDifficulties: getAllowedDifficulties(moduleTerm),
      alignmentStatus: status,
      alignmentNote,
      appropriateSimPool,
      recommendedSims,
      rejectedNearMatches: buildRejectedSims(moduleTerm, module, false, catalog, allowAdvancedInTerm3),
    };
  });
}

export function buildProgramTermAlignment(
  syllabi: UploadedSyllabus[],
  catalog: SimulationCatalogItem[] = simCatalog,
): ProgramTermAlignment[] {
  return (Object.keys(termRules) as ProgramTerm[]).map((term) => ({
    term,
    termLabel: termRules[term].label,
    uploadedSyllabi: syllabi
      .filter((syllabus) => syllabus.assignedProgramTerm === term)
      .map((syllabus) => ({
        syllabusId: syllabus.id,
        fileName: syllabus.fileName,
        detectedCourseTitle: syllabus.detectedCourseTitle,
        detectedCourseCode: syllabus.detectedCourseCode,
        parsingStatus: syllabus.parsingStatus,
        parseMessage: syllabus.parseMessage,
        clinicalFocusSummary: uniqueStrings(
          syllabus.parsedModules.flatMap((module) => getClinicalFocusTerms(module)),
        ).slice(0, 14),
        recommendations: assignSims(syllabus.parsedModules, syllabus.assignedProgramTerm, catalog),
      })),
  }));
}

export function generateDebriefQuestions(
  module: ParsedSyllabusModule,
  sim: SimulationCatalogItem,
): DebriefQuestions {
  return {
    allans3w: [
      `What is wrong with this ${module.topic.toLowerCase()} patient scenario?`,
      `What are you going to do for the patient in ${sim.name}?`,
      "When are you going to stop, change, escalate, or discontinue therapy?",
    ],
    therapyIndication: "How do you know the therapy was indicated for this patient?",
    therapyEffectiveness: "How do you know it is working?",
    setupAccuracy: "How do you know it is set up correctly?",
    evidenceRequired:
      "What lab work, bedside findings, chart data, or patient response proves it is effective or ineffective?",
    stopChangeEscalate: "What would make you stop, change, escalate, or discontinue therapy?",
  };
}

function difficultyTierBonus(
  sim: SimulationCatalogItem,
  term: ProgramTerm,
  module: ParsedSyllabusModule,
): number {
  const rule = getTermRules(term);
  if (rule.allowedPrimaryDifficulties.includes(sim.difficulty)) {
    return 5;
  }
  if (rule.allowedReviewDifficulties.includes(sim.difficulty)) {
    return 2;
  }
  return 0;
}

function getAlignmentStatus(score: number, warning?: string): AlignmentStatus {
  if (score <= 0) return "No clean match";
  if (warning) return "Partial";
  if (score >= 72) return "Full";
  if (score >= 45) return "Partial";
  return "Weak";
}

function buildAlignmentNote(
  status: AlignmentStatus,
  module: ParsedSyllabusModule,
  bestSim: SimulationCatalogItem | undefined,
  term: ProgramTerm,
): string {
  if (!bestSim) {
    return `No eligible simulation had enough overlap with ${module.topic}. Higher-tier sims remain blocked by ${term} readiness gates.`;
  }
  if (status === "Full") {
    return `${bestSim.name} is a strong clinical, objective, Bloom, and readiness fit.`;
  }
  if (status === "Partial") {
    return `${bestSim.name} is useful for ${module.topic}, but it may need instructor framing or bridge/remediation use.`;
  }
  return `${bestSim.name} is a broad match. Confirm details before assigning.`;
}

function sharedMatchSummary(module: ParsedSyllabusModule, sim: SimulationCatalogItem): string {
  const moduleTerms = getClinicalFocusTerms(module).map(normalizeText);
  const simTerms = [...sim.clinicalFocus, ...sim.pathologies, ...sim.content, ...sim.skills];
  const shared = simTerms.filter((term) => {
    const normalized = normalizeText(term);
    return moduleTerms.some((moduleTerm) => moduleTerm.includes(normalized) || normalized.includes(moduleTerm));
  });

  const allModuleText = [module.topic, ...module.learningObjectives].join(" ").toLowerCase();
  const allSimText = [sim.name, ...sim.content, ...sim.clinicalFocus, ...sim.pathologies, ...sim.skills].join(" ").toLowerCase();

  if (allModuleText.includes("gas exchange") || allModuleText.includes("oxygen transport")) {
    const specificMatches = ["oxygenation", "ventilation", "abg", "gas exchange", "respiratory failure", "acid-base", "co2 elimination", "carbon dioxide transport", "oxygen transport"].filter(kw => allSimText.includes(kw));
    if (specificMatches.length > 0) {
      shared.push(...specificMatches);
    }
  }

  if (allModuleText.includes("abg") || allModuleText.includes("acid-base")) {
    const specificMatches = ["abg", "acid-base", "blood gas"].filter(kw => allSimText.includes(kw));
    if (specificMatches.length > 0) {
      shared.push(...specificMatches);
    }
  }

  if (allModuleText.includes("hemodynamic") || allModuleText.includes("pressure") || allModuleText.includes("volume")) {
    const specificMatches = ["hemodynamic", "cardiopulmonary", "monitoring", "cvo2", "pvr"].filter(kw => allSimText.includes(kw));
    if (specificMatches.length > 0) {
      shared.push(...specificMatches);
    }
  }

  if (allModuleText.includes("chest radiograph") || allModuleText.includes("imaging") || allModuleText.includes("mri") || allModuleText.includes("laboratory")) {
    const specificMatches = ["pneumonia", "embolism", "copd", "ards", "radiograph", "x-ray", "imaging"].filter(kw => allSimText.includes(kw));
    if (specificMatches.length > 0) {
      shared.push(...specificMatches);
    }
  }

  return uniqueStrings(shared).slice(0, 4).join(", ") || "general respiratory care decision making";
}

function buildRejectedSims(
  term: ProgramTerm,
  module: ParsedSyllabusModule,
  includeAll: boolean,
  catalog: SimulationCatalogItem[] = simCatalog,
  allowAdvancedInTerm3 = false,
): SimRecommendationResult["rejectedNearMatches"] {
  return catalog
    .map((sim) => ({
      sim,
      allowed: isDifficultyAllowed(sim, term, module, allowAdvancedInTerm3),
      overlap: hasClinicalOverlap(module, sim),
    }))
    .filter(({ allowed, overlap }) => includeAll || !allowed || overlap)
    .map(({ sim, allowed, overlap }) => ({
      id: sim.id,
      name: sim.name,
      difficulty: sim.difficulty,
      reasonRejected: getRejectReason(sim, term, module, allowed, overlap),
    }))
    .filter((item) => item.reasonRejected)
    .slice(0, 10);
}

function getRejectReason(
  sim: SimulationCatalogItem,
  term: ProgramTerm,
  module: ParsedSyllabusModule,
  allowed: boolean,
  overlap: boolean,
): string {
  if (!allowed) {
    if (sim.difficulty === "Intermediate" && term === "Term 1") {
      return "Intermediate simulations are blocked in Term 1.";
    }
    if (sim.difficulty === "Advanced" && term === "Term 3") {
      return "Advanced simulations require an explicit instructor flag in Term 3.";
    }
    if (sim.difficulty === "Advanced" && !["Term 4", "Term 5"].includes(term)) {
      return "Advanced simulations are blocked before Term 4 unless explicitly allowed for Term 3.";
    }
    if (sim.difficulty === "NBRC" || sim.difficulty === "Variable") {
      return "NBRC and Variable simulations are blocked before Term 5.";
    }
    if (getTermRules(term).allowedReviewDifficulties.includes(sim.difficulty)) {
      if (term === "Term 5") {
        return "Lower-tier Term 5 sims are limited to review, remediation, or reinforcement.";
      }
      return "Lower-tier review sim is only appropriate when term exposure rules allow bridge, review, remediation, or first exposure.";
    }
    return `${sim.difficulty} is blocked by the ${term} readiness rule.`;
  }
  if (!overlap) {
    return "Eligible by tier, but weak clinical/topic overlap.";
  }
  return "";
}

function getReadinessWarning(
  term: ProgramTerm,
  module: ParsedSyllabusModule,
  sim: SimulationCatalogItem,
  score: number,
): string | undefined {
  if (term === "Term 5" && ["NBRC", "Variable"].includes(sim.difficulty) && module.topicExposureStatus === "first_introduction") {
    return "Warning: do not introduce brand-new exam-level reasoning for the first time without faculty review.";
  }
  if (score < 70) {
    return "Use with instructor framing because the match is useful but not complete.";
  }
  return undefined;
}

function fallbackInsufficientModule(): ParsedSyllabusModule {
  return {
    weekOrModule: "Unparsed",
    topic: "Insufficient parsed data",
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
}
