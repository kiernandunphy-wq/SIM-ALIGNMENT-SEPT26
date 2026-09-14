export type BloomLevel =
  | "Remember"
  | "Understand"
  | "Apply"
  | "Analyze"
  | "Evaluate"
  | "Create";

export type TopicExposureStatus =
  | "first_introduction"
  | "review_reinforcement"
  | "builds_on_prior_sim"
  | "remediation"
  | "integration_assessment"
  | "end_of_program_mastery";

export type ParsedSyllabusModule = {
  courseCode?: string;
  courseTitle?: string;
  sourcePage?: number;
  weekOrModule: string;
  topic: string;
  learningObjectives: string[];
  detectedBloomLevel: BloomLevel;
  clinicalFocus: {
    patientPopulation: string[];
    pathologies: string[];
    therapies: string[];
    equipment: string[];
    assessmentData: string[];
    skills: string[];
    decisionTypes: string[];
  };
  topicExposureStatus: TopicExposureStatus;
};

export type ParsedSyllabusResponse = {
  institutionName?: string;
  courseCode?: string;
  courseTitle?: string;
  courseDescription?: string;
  learningObjectives?: string[];
  modules: ParsedSyllabusModule[];
};

export type SimulationDifficulty =
  | "Basic"
  | "Intermediate"
  | "Advanced"
  | "NBRC"
  | "Variable";

export type SimulationCatalogItem = {
  id: string;
  name: string;
  difficulty: SimulationDifficulty;
  clinicalFocus: string[];
  pathologies: string[];
  content: string[];
  skills: string[];
  bloomTargets: BloomLevel[];
  endOfProgramOnly?: boolean;
  debriefFocus: string[];
  readinessWarning?: string;
};

export type ProgramTerm =
  | "Term 1"
  | "Term 2"
  | "Term 3"
  | "Term 4"
  | "Term 5";

export type ProgramTermAssignment = ProgramTerm | "Unassigned";

export type TermRule = {
  term: ProgramTerm;
  label: string;
  assignedTier: string;
  allowedPrimaryDifficulties: SimulationDifficulty[];
  allowedReviewDifficulties: SimulationDifficulty[];
  blockedDifficulties: SimulationDifficulty[];
};

export type AlignmentStatus =
  | "Full"
  | "Partial"
  | "Weak"
  | "No clean match"
  | "Needs faculty review";

export type DebriefQuestions = {
  allans3w: string[];
  therapyIndication: string;
  therapyEffectiveness: string;
  setupAccuracy: string;
  evidenceRequired: string;
  stopChangeEscalate: string;
};

export type SimRecommendationResult = {
  term: ProgramTerm;
  termLabel: string;
  courseCode?: string;
  courseTitle?: string;
  weekOrModule: string;
  topic: string;
  learningObjectives: string[];
  detectedBloomLevel: BloomLevel;
  clinicalFocusSummary: string[];
  topicExposureStatus: TopicExposureStatus;
  sourcePage?: number;
  readinessRequirements: string[];
  implementationSequence: string[];
  assignedDifficultyTier: string;
  allowedDifficulties: SimulationDifficulty[];
  alignmentStatus: AlignmentStatus;
  alignmentNote: string;
  appropriateSimPool: Array<{
    id: string;
    name: string;
    difficulty: SimulationDifficulty;
    score: number;
    whyAppropriate: string;
  }>;
  recommendedSims: Array<{
    id: string;
    name: string;
    difficulty: SimulationDifficulty;
    score: number;
    rationale: string;
    bloomAlignment: string;
    readinessAlignment: string;
    instructorUseNote: string;
    not100PercentAlignmentNote?: string;
    debriefQuestions: DebriefQuestions;
  }>;
  rejectedNearMatches: Array<{
    id: string;
    name: string;
    difficulty: SimulationDifficulty;
    reasonRejected: string;
  }>;
};

export type UploadedSyllabus = {
  id: string;
  sourceDocumentId?: string;
  sourceFileName?: string;
  fileName: string;
  rawText?: string;
  detectedInstitutionName?: string;
  detectedCourseCode?: string;
  detectedCourseTitle?: string;
  assignedProgramTerm: ProgramTermAssignment;
  termAssignmentSource?: "course_code" | "filename" | "content_inference" | "manual_override";
  termAssignmentConfidence?: "high" | "medium" | "low";
  termAssignmentReason?: string;
  parseConfidence?: "high" | "medium" | "low";
  extractionMethod?: "text" | "visual_pdf" | "deterministic_fallback";
  parsedModules: ParsedSyllabusModule[];
  parsingStatus: "pending" | "parsing" | "parsed" | "fallback" | "error";
  rawParsedJson?: unknown;
  parseMessage?: string;
};

export type ProgramTermAlignment = {
  term: ProgramTerm;
  termLabel: string;
  uploadedSyllabi: Array<{
    syllabusId: string;
    fileName: string;
    detectedCourseTitle?: string;
    detectedCourseCode?: string;
    parsingStatus?: string;
    parseMessage?: string;
    parseConfidence?: "high" | "medium" | "low";
    extractionMethod?: "text" | "visual_pdf" | "deterministic_fallback";
    clinicalFocusSummary: string[];
    recommendations: SimRecommendationResult[];
  }>;
};

export type ClassmateAssignment = {
  id: string;
  title: string;
  courseCode?: string;
  moduleTitle: string;
  term: ProgramTerm;
  simId: string;
  simName: string;
  simDifficulty: SimulationDifficulty;
  objectives: string[];
  debriefQuestions: string[];
  dueDate: string;
  points: number;
  studentInstructions: string;
  createdAt: string;
  status: "published" | "draft";
};
