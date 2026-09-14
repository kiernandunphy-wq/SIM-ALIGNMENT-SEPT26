import type { BloomLevel, SimulationCatalogItem, SimulationDifficulty } from "../types";

type RawSimulationCatalogItem = {
  name: string;
  difficulty: SimulationDifficulty;
  pathologies: string;
  content: string;
  mappingRationale: string;
};

const rawSimCatalog: RawSimulationCatalogItem[] = [
  {
    name: "Oxygen Rounds",
    difficulty: "Basic",
    pathologies: "Respiratory distress",
    content: "Oxygen therapy, Troubleshooting equipment problems",
    mappingRationale: "Intro oxygen therapy & safety",
  },
  {
    name: "Al K. Seltzer",
    difficulty: "Basic",
    pathologies: "Atelectasis, Obesity, Respiratory distress",
    content:
      "Diagnostic imaging, Drug therapy, Home Care, IPPB therapy, Oxygen therapy, Patient interview and history, Physical examination, Troubleshooting patient problems",
    mappingRationale: "Bedside assessment, oxygen therapy, radiograph assessment, IPPB therapy",
  },
  {
    name: "Mr. R.T. Fuller",
    difficulty: "Basic",
    pathologies: "Pneumonia",
    content: "Conflict resolution, Oxygen therapy, Troubleshooting equipment problems",
    mappingRationale: "Foundational bedside care",
  },
  {
    name: "Joe Blow",
    difficulty: "Basic",
    pathologies: "Pneumonia, Respiratory distress",
    content:
      "Aerosol therapy, Charting, Conflict resolution, Gas delivery equipment, Oxygen therapy, Patient interview and history, Physical examination, Pulse oximetry, Troubleshooting equipment problems",
    mappingRationale: "Basic aerosol & oxygen application",
  },
  {
    name: "Flo Mieter",
    difficulty: "Basic",
    pathologies: "COPD, Pneumonia",
    content:
      "Aerosol therapy, Ethical issues, Gas delivery equipment, Laboratory testing, Oxygen therapy, Pulse oximetry, Review medical records, Troubleshooting equipment problems",
    mappingRationale: "Gas delivery calculations",
  },
  {
    name: "George Jayson",
    difficulty: "Basic",
    pathologies: "Gun shot wound",
    content: "Incentive spirometry, Oxygen therapy, Review medical records",
    mappingRationale: "Order verification & hyperinflation",
  },
  {
    name: "Aronda Howz",
    difficulty: "Basic",
    pathologies: "Atelectasis, Obesity, Post-Op Care",
    content:
      "Charting, Conflict resolution, Diagnostic imaging, Incentive spirometry, Laboratory testing, Oxygen therapy, Patient interview and history, Physical examination, Pulse oximetry, Review medical records",
    mappingRationale: "Post-op atelectasis",
  },
  {
    name: "Harry Bach",
    difficulty: "Basic",
    pathologies: "Congestive heart failure, COPD, Cor Pulmonale, Respiratory distress",
    content:
      "Aerosol therapy, Oxygen therapy, Patient interview and history, Physical examination, Troubleshooting equipment problems, Troubleshooting patient problems",
    mappingRationale: "CHF/COPD assessment intro",
  },
  {
    name: "Ima Sycamore",
    difficulty: "Basic",
    pathologies: "COPD, Pneumonia",
    content:
      "Aerosol therapy, Charting, Drug therapy, Ethical issues, Laboratory testing, Oxygen therapy, Patient interview and history, Physical examination",
    mappingRationale: "COPD + documentation",
  },
  {
    name: "Slim Pickins",
    difficulty: "Basic",
    pathologies: "COPD, Pre-Op Care, Respiratory distress, Trauma",
    content:
      "Aerosol therapy, Breathing exercises, Conflict resolution, Diagnostic imaging, Drug therapy, Laboratory testing, Patient interview and history, Physical examination, Review medical records",
    mappingRationale: "Pre-op & basic diagnostics",
  },
  {
    name: "Patty Mitrail",
    difficulty: "Basic",
    pathologies: "Post-Op Care, Pre-Op Care, Ventilatory failure",
    content: "BCLS, Incentive spirometry",
    mappingRationale: "Pre/Post-op care & CPR",
  },
  {
    name: "Johnny Casper",
    difficulty: "Intermediate",
    pathologies: "Pneumonia",
    content:
      "BCLS, Bronchial hygiene, Charting, Conflict resolution, Diagnostic imaging, Gas delivery equipment, Oxygen therapy, Patient interview and history, Physical examination, Pulse oximetry",
    mappingRationale: "Pneumonia + BCLS",
  },
  {
    name: "Hy Ball",
    difficulty: "Intermediate",
    pathologies: "Atelectasis, Pneumonia, Trauma",
    content:
      "Arterial blood gas, Bronchial hygiene, Conflict resolution, Diagnostic imaging, IPPB therapy, Laboratory testing, Patient interview and history, Physical examination, Pulse oximetry, Review medical records, Suctioning, Troubleshooting equipment problems",
    mappingRationale: "Trauma + ABG + imaging",
  },
  {
    name: "Inowana Newby",
    difficulty: "Intermediate",
    pathologies: "Atelectasis, COPD, Cor Pulmonale, Respiratory distress",
    content:
      "Aerosol therapy, Arterial blood gas, Bronchial hygiene, Conflict resolution, IPPB therapy, Oxygen therapy, Patient interview and history, Physical examination, Review medical records",
    mappingRationale: "ABG + bronchial hygiene",
  },
  {
    name: "James Brown",
    difficulty: "Intermediate",
    pathologies: "Adult asthma, Cardiovascular disease, Pulmonary Embolism",
    content:
      "Arterial blood gas, Diagnostic imaging, Equipment Selection, Laboratory testing, Oxygen therapy, Patient interview and history, Physical examination, Review medical records, Troubleshooting equipment problems, Troubleshooting patient problems",
    mappingRationale: "PE + A-Fib integration",
  },
  {
    name: "Larry Hart",
    difficulty: "Intermediate",
    pathologies: "Cardiovascular disease, Coronary artery bypass graft, Post-Op Care",
    content:
      "Aerosol therapy, Arterial blood gas, Bronchial hygiene, Conflict resolution, Equipment Selection, IPPB therapy, Laboratory testing, Oxygen therapy, Physical examination, Review medical records",
    mappingRationale: "CABG + cardiac step-down",
  },
  {
    name: "Summer Brees",
    difficulty: "Intermediate",
    pathologies: "Pneumonia",
    content:
      "Aerosol therapy, Diagnostic imaging, Drug therapy, Laboratory testing, Oxygen therapy, Patient interview and history, Physical examination, Pulse oximetry, Suctioning",
    mappingRationale: "Pneumonia lab + drug therapy",
  },
  {
    name: "Will Williams",
    difficulty: "Intermediate",
    pathologies: "Pneumonia",
    content:
      "Aerosol therapy, Arterial blood gas, Bronchial hygiene, Drug therapy, Laboratory testing, Oxygen therapy, Patient interview and history, Physical examination, Review medical records",
    mappingRationale: "ABG pneumonia management",
  },
  {
    name: "See O'Peedy",
    difficulty: "Intermediate",
    pathologies: "COPD",
    content:
      "Diagnostic imaging, Home Care, Laboratory testing, Oxygen therapy, Patient interview and history, Physical examination, Rehabilitation, Review medical records",
    mappingRationale: "COPD discharge planning",
  },
  {
    name: "BoBo Brazil",
    difficulty: "Intermediate",
    pathologies: "Gun shot wound",
    content:
      "Aerosol therapy, BCLS, Ethical issues, Laboratory testing, Mechanical Ventilation, Oxygen therapy, Patient interview and history, Physical examination, Resuscitation equipment",
    mappingRationale: "Trauma + ethical prioritization",
  },
  {
    name: "Albert O'Hall",
    difficulty: "Intermediate",
    pathologies: "Pediatric asthma",
    content:
      "Arterial blood gas, Conflict resolution, Drug therapy, Oxygen therapy, Patient interview and history, Physical examination, Review medical records, Troubleshooting patient problems",
    mappingRationale: "Pediatric asthma",
  },
  {
    name: "Anita Help",
    difficulty: "Intermediate",
    pathologies: "Airway obstruction, Choking victim, Laryngeal cancer, Post-Op Care",
    content:
      "Aerosol therapy, Arterial blood gas, Disinfection and sterilization, Ethical issues, Oxygen therapy, Physical examination, Tracheostomy, Troubleshooting equipment problems",
    mappingRationale: "Airway obstruction emergency",
  },
  {
    name: "Bill Breathlyze",
    difficulty: "Advanced",
    pathologies: "COPD, Pneumonia, Respiratory distress",
    content:
      "Breathing exercises, Charting, Drug therapy, Equipment Selection, Ethical issues, Gas delivery equipment, Home Care, Oxygen therapy, Patient education, Patient interview and history, Physical examination, Rehabilitation, Troubleshooting equipment problems, Troubleshooting patient problems",
    mappingRationale: "COPD rehab escalation",
  },
  {
    name: "Charles H. Fulmer",
    difficulty: "Advanced",
    pathologies: "Congestive heart failure, Pulmonary Edema",
    content: "Ethical issues, Mechanical Ventilation, Troubleshooting patient problems",
    mappingRationale: "CHF + PEEP management",
  },
  {
    name: "Darlene Dyspnea",
    difficulty: "Advanced",
    pathologies: "Adult asthma",
    content:
      "Conflict resolution, Discharge planning, Drug therapy, Equipment Selection, MDI/DPI therapy, Oxygen therapy, Patient interview and history, Physical examination, Pulmonary Function Testing, Pulse oximetry",
    mappingRationale: "Acute asthma ED",
  },
  {
    name: "Freddie Freestoner",
    difficulty: "Advanced",
    pathologies: "Sleep disorders",
    content:
      "Arterial blood gas, Ethical issues, Laboratory testing, Patient interview and history, Physical examination, Sleep Medicine",
    mappingRationale: "Sleep disorder mgmt",
  },
  {
    name: "Ginger Jones",
    difficulty: "Advanced",
    pathologies: "Sleep disorders",
    content: "Equipment Selection, Ethical issues, Patient interview and history, Physical examination, Sleep Medicine",
    mappingRationale: "Sleep lab assessment",
  },
  {
    name: "Ivan Baad",
    difficulty: "Advanced",
    pathologies: "Tuberculosis",
    content:
      "Conflict resolution, Diagnostic imaging, Drug therapy, Laboratory testing, Oxygen therapy, Patient interview and history, Physical examination, Pulse oximetry",
    mappingRationale: "Tuberculosis",
  },
  {
    name: "Jimmy La Doore",
    difficulty: "Advanced",
    pathologies: "Myocardial Infarction",
    content: "Drug therapy, Ethical issues, Gas delivery equipment, Oxygen therapy, Troubleshooting equipment problems",
    mappingRationale: "MI + ECG management",
  },
  {
    name: "Lee Ann Wenner",
    difficulty: "Advanced",
    pathologies: "Neuromuscular disease",
    content: "Airway care, Mechanical Ventilation",
    mappingRationale: "Guillain-Barre ventilator",
  },
  {
    name: "Ovis Hill",
    difficulty: "Advanced",
    pathologies: "Post op Aortic Aneurysm",
    content: "Ethical issues, Mechanical Ventilation, Troubleshooting",
    mappingRationale: "Vent initiation + ethics",
  },
  {
    name: "Paul Lyer",
    difficulty: "Advanced",
    pathologies: "COPD, Pneumonia",
    content: "Ethical issues, Mechanical Ventilation, Troubleshooting patient problems",
    mappingRationale: "Vent mgmt COPD",
  },
  {
    name: "Sally Salty",
    difficulty: "Advanced",
    pathologies: "Cystic fibrosis",
    content:
      "Aerosol therapy, Bronchial hygiene, Conflict resolution, Disinfection and sterilization, Drug therapy, Equipment Selection, Infection Control, Laboratory testing, Physical examination",
    mappingRationale: "Pediatric CF",
  },
  {
    name: "Shelly Ann Bazen-Atkins",
    difficulty: "Advanced",
    pathologies: "Adult asthma",
    content: "Asthma Management, Mechanical Ventilation, Troubleshooting patient problems",
    mappingRationale: "Status asthmaticus vent",
  },
  {
    name: "John Doe",
    difficulty: "Advanced",
    pathologies: "Alcohol and drug abuse, Respiratory distress",
    content:
      "Charting, Drug therapy, Equipment Selection, Laboratory testing, Oxygen therapy, Physical examination, Pulse oximetry",
    mappingRationale: "Drug overdose + distress",
  },
  {
    name: "Anna Recsik",
    difficulty: "Advanced",
    pathologies: "Sleep disorders, Vascular disease",
    content: "Patient interview and history, Physical examination, Sleep Medicine",
    mappingRationale: "Sleep disorder vascular",
  },
  {
    name: "Baby Adams",
    difficulty: "Advanced",
    pathologies: "Persistent Fetal Circulation (PDA), Respiratory distress",
    content:
      "Airway care, Arterial blood gas, CPAP Therapy, Laboratory testing, Mechanical Ventilation, Oxygen therapy, Physical examination, Review medical records, Troubleshooting equipment problems, Troubleshooting patient problems",
    mappingRationale: "Neonate PDA",
  },
  {
    name: "Baby Baxter",
    difficulty: "Advanced",
    pathologies: "Airway obstruction, Choanal atresia",
    content: "Airway care, Diagnostic imaging, NRP, Physical examination, Special Procedures, Troubleshooting patient problems",
    mappingRationale: "Choanal atresia",
  },
  {
    name: "Baby Collins",
    difficulty: "Advanced",
    pathologies: "Pneumothorax, Ventilatory failure",
    content: "Arterial blood gas, Equipment Selection, Mechanical Ventilation, Oxygen therapy, Physical examination, Troubleshooting patient problems",
    mappingRationale: "HFOV neonate",
  },
  {
    name: "Baby Greene",
    difficulty: "Advanced",
    pathologies: "Cardiac anomalies, Persistent Fetal Circulation (PDA), Respiratory distress",
    content: "Arterial blood gas, Diagnostic imaging, Drug therapy, Mechanical Ventilation, Oxygen therapy, Physical examination",
    mappingRationale: "IRDS neonate",
  },
  {
    name: "Angie Valerie Roberts",
    difficulty: "Advanced",
    pathologies: "Post-Op Care",
    content: "Chest Drainage, Mechanical Ventilation, Troubleshooting patient problems",
    mappingRationale: "Post-op vent mgmt",
  },
  {
    name: "Problem 1",
    difficulty: "NBRC",
    pathologies: "Emphysema, Impending respiratory failure",
    content:
      "Advance directives, Arterial blood gas, Discharge planning, Drug therapy, Ethical issues, Intubation, Mechanical Ventilation, Oxygen therapy, Physical examination, Pulse oximetry, Rehabilitation",
    mappingRationale: "Resp failure + ethics",
  },
  {
    name: "Problem 2",
    difficulty: "NBRC",
    pathologies: "COPD",
    content:
      "Equipment Selection, Gas delivery equipment, Home Care, Oxygen therapy, Patient education, Patient interview and history, Physical examination, Rehabilitation, Review medical records, Troubleshooting equipment problems",
    mappingRationale: "Home oxygen rehab",
  },
  {
    name: "Problem 3",
    difficulty: "NBRC",
    pathologies: "Brain death, Bronchiectasis, Organ donor, Respiratory distress, Ventilatory failure",
    content: "End of life care, Intubation, Mechanical Ventilation",
    mappingRationale: "Brain death + vent mgmt",
  },
  {
    name: "Problem 4",
    difficulty: "NBRC",
    pathologies: "Obesity, Sleep disorders",
    content: "CPAP Therapy, Equipment Selection, Pulse oximetry, Sleep Medicine, Troubleshooting equipment problems, Troubleshooting patient problems",
    mappingRationale: "OSA + CPAP titration",
  },
  {
    name: "Problem 5",
    difficulty: "NBRC",
    pathologies: "Pneumothorax",
    content: "Chest Drainage, Diagnostic imaging, Drug therapy, Oxygen therapy, Pulse oximetry, Troubleshooting equipment problems",
    mappingRationale: "Spontaneous pneumothorax",
  },
  {
    name: "Problem 6",
    difficulty: "NBRC",
    pathologies: "Emphysema, Hypoxic drive, Respiratory distress, Ventilatory failure",
    content:
      "Airway care, Arterial blood gas, End of life care, Equipment Selection, Intubation, Mechanical Ventilation, Physical examination, Review medical records, Troubleshooting patient problems",
    mappingRationale: "COPD intubation escalation",
  },
  {
    name: "Problem 7",
    difficulty: "NBRC",
    pathologies: "Adult asthma, Respiratory distress",
    content: "Asthma Management, Drug therapy, Ethical issues, MDI/DPI therapy, Patient education, Smoking cessation, Troubleshooting patient problems",
    mappingRationale: "Asthma mgmt outpatient",
  },
  {
    name: "Problem 8",
    difficulty: "NBRC",
    pathologies: "Congestive heart failure, Pulmonary Edema",
    content:
      "Arterial blood gas, Cardiac care, Discharge planning, Drug therapy, NIPPV, Patient education, Patient interview and history, Physical examination, Troubleshooting equipment problems, Troubleshooting patient problems",
    mappingRationale: "CHF + NIPPV",
  },
  {
    name: "Problem 9",
    difficulty: "NBRC",
    pathologies: "Aspiration, Neuromuscular disease, Pneumonia",
    content: "Drug therapy, Equipment Selection, Hyperinflation therapy, Laboratory testing, Oxygen therapy, Physical examination, Special Procedures",
    mappingRationale: "Neuromuscular + aspiration",
  },
  {
    name: "Problem 10",
    difficulty: "NBRC",
    pathologies: "Adult asthma",
    content: "Arterial blood gas, Asthma Management, Oxygen therapy, Patient interview and history, Physical examination, Pulmonary Function Testing, Special Procedures",
    mappingRationale: "Asthma + PFT confirmation",
  },
  {
    name: "Problem 11",
    difficulty: "NBRC",
    pathologies: "Bronchiolitis, Respiratory distress, RSV infection",
    content: "Drug therapy, Laboratory testing, Oxygen therapy, Patient interview and history, Physical examination",
    mappingRationale: "Pediatric RSV bronchiolitis",
  },
  {
    name: "Problem 12",
    difficulty: "NBRC",
    pathologies: "Tuberculosis",
    content: "Drug therapy, Infection Control, Laboratory testing, Patient interview and history, Physical examination",
    mappingRationale: "Tuberculosis isolation",
  },
  {
    name: "Problem 13",
    difficulty: "NBRC",
    pathologies: "Adult asthma, ARDS, Impending respiratory failure, Obesity, Respiratory distress",
    content: "Airway graphics, ARDSNet protocols, Arterial blood gas, Asthma Management, Drug therapy, Hemodynamics, Mechanical Ventilation, Oxygen therapy, Troubleshooting",
    mappingRationale: "ARDS + ARDSNet",
  },
  {
    name: "Problem 14",
    difficulty: "NBRC",
    pathologies: "Cystic fibrosis, Pneumonia, Respiratory distress",
    content:
      "Bronchial hygiene, Discharge planning, Drug therapy, Home Care, Laboratory testing, Oxygen therapy, Patient education, Patient interview and history, Physical examination, Pulse oximetry",
    mappingRationale: "Cystic fibrosis",
  },
  {
    name: "Problem 15",
    difficulty: "NBRC",
    pathologies: "Impending respiratory failure, IRDS, Pre-mature neonate, Respiratory distress",
    content: "Arterial blood gas, CPAP Therapy, Delivery room care, Laboratory testing, Oxygen therapy, Physical examination, Surfactant therapy",
    mappingRationale: "Premature neonate IRDS",
  },
  {
    name: "Problem 16",
    difficulty: "NBRC",
    pathologies: "Cardiac anomalies, Myocardial Infarction, Respiratory distress",
    content: "Cardiac care, ECG Interpretation, Equipment Selection, Oxygen therapy, Patient interview and history, Physical examination, Special Procedures, Troubleshooting patient problems",
    mappingRationale: "MI + cardioversion",
  },
  {
    name: "Problem 17",
    difficulty: "NBRC",
    pathologies: "Pediatric asthma",
    content: "Asthma Management, MDI/DPI therapy, Patient education, Patient interview and history, Physical examination, Pulmonary Function Testing, Troubleshooting",
    mappingRationale: "Pediatric asthma education",
  },
  {
    name: "Problem 18",
    difficulty: "NBRC",
    pathologies: "Near drowning, Trauma",
    content: "Airway care, Ethical issues, Intubation, Mechanical Ventilation, Special Procedures",
    mappingRationale: "Near drowning trauma",
  },
  {
    name: "Problem 19",
    difficulty: "NBRC",
    pathologies: "Pre-mature neonate",
    content: "Delivery room care, Intubation, NRP, Physical examination",
    mappingRationale: "Neonatal resuscitation",
  },
  {
    name: "Problem 20",
    difficulty: "NBRC",
    pathologies: "HIV, Immunocompromised, Infectious disease",
    content:
      "Bronchial alveolar lavage (BAL), Drug therapy, ELISA testing, Infection Control, Laboratory testing, Oxygen therapy, Patient interview and history, Physical examination, Review medical records, Special Procedures, Sputum analysis",
    mappingRationale: "HIV pneumonia",
  },
  {
    name: "Problem 21",
    difficulty: "NBRC",
    pathologies: "ARDS, Flail chest, Trauma",
    content: "APRV, ARDSNet protocols, Intubation, Mechanical Ventilation",
    mappingRationale: "Flail chest ARDS",
  },
  {
    name: "Problem 22",
    difficulty: "NBRC",
    pathologies: "COPD",
    content: "Drug therapy, Equipment Selection, Ethical issues, MDI/DPI therapy, Patient education, Patient interview and history, Rehabilitation",
    mappingRationale: "Non-compliant COPD",
  },
];

export const simCatalog: SimulationCatalogItem[] = rawSimCatalog.map((item) => {
  const pathologyTerms = splitTerms(item.pathologies);
  const contentTerms = splitTerms(item.content);
  const rationaleTerms = splitTerms(item.mappingRationale.replace(/\+/g, ","));
  const clinicalFocus = uniqueTerms([...pathologyTerms, ...contentTerms, ...rationaleTerms]);

  return {
    id: `${item.difficulty.toLowerCase()}-${slugify(item.name)}`,
    name: item.name,
    difficulty: item.difficulty,
    clinicalFocus,
    pathologies: pathologyTerms,
    content: contentTerms,
    skills: uniqueTerms([...contentTerms, ...rationaleTerms]),
    bloomTargets: getBloomTargets(item.difficulty),
    endOfProgramOnly: item.difficulty === "NBRC",
    debriefFocus: uniqueTerms([...pathologyTerms, ...rationaleTerms, ...contentTerms.slice(0, 6)]),
    readinessWarning:
      item.difficulty === "NBRC" ? "Use only for end-of-program NBRC readiness." : undefined,
  };
});

function splitTerms(value: string): string[] {
  return value
    .split(",")
    .map((term) => term.trim())
    .filter(Boolean);
}

function uniqueTerms(terms: string[]): string[] {
  return Array.from(new Set(terms.filter(Boolean)));
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function getBloomTargets(difficulty: SimulationDifficulty): BloomLevel[] {
  if (difficulty === "Basic") {
    return ["Remember", "Understand", "Apply"];
  }
  if (difficulty === "Intermediate") {
    return ["Apply", "Analyze", "Evaluate"];
  }
  return ["Analyze", "Evaluate", "Create"];
}
