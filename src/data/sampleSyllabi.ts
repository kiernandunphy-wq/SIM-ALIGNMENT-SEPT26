export interface SyllabusPreset {
  name: string;
  code: string;
  term: "Term 1" | "Term 2" | "Term 3" | "Term 4" | "Term 5";
  text: string;
}

export const SYLLABUS_PRESETS: SyllabusPreset[] = [
  {
    name: "Intro to Respiratory Care & Oxygen Therapy",
    code: "RT 101",
    term: "Term 1",
    text: `Course Title: Introduction to Respiratory Care & Oxygen Therapy (RT 101)
Course Description:
This foundational course introduces students to the basic concepts of respiratory care, patient assessment, and the therapeutic application of oxygen. Topics include airway anatomy, vital signs assessment, arterial blood gas sampling techniques, and oxygen delivery equipment.

Course Learning Objectives:
- Identify basic thoracic anatomy and respiratory muscle functions.
- Perform safe patient assessment including taking respiratory rates, pulse oximetry, and breath sounds.
- Select appropriate low-flow and high-flow oxygen delivery devices (cannulas, simple masks, Venturi masks) based on clinical data.
- Explain the principles of aerosol and humidity therapy.
- Demonstrate basic arterial puncture technique for blood gas collection.

Weekly Outline & Modules:
Module 1: Thoracic Anatomy & Physiology
- Key concepts: ventilation, diffusion, pulmonary perfusion.
- Assessment of work of breathing and oxygenation.

Module 2: Basic Patient Assessment & Vital Signs
- Hands-on practice: auscultation of breath sounds (wheezing, crackles, clear).
- Pulse oximetry monitoring, respiratory rate, and heart rate patterns.

Module 3: Medical Gas Therapy & Oxygen Equipment
- Storage and safety of oxygen cylinders.
- Fitting and clinical application of nasal cannulas, non-rebreather masks, and Venturi systems.

Module 4: Humidity and Aerosol Administration
- Indications for nebulizers, spacer devices, and humidifiers.
- Safe administration of bronchodilators.`
  },
  {
    name: "Mechanical Ventilation & Advanced Life Support",
    code: "RT 303",
    term: "Term 3",
    text: `Course Title: Mechanical Ventilation & Advanced Life Support (RT 303)
Course Description:
An in-depth study of invasive mechanical ventilation, including indications, initial setup, mode selection, ventilator graphics, blood gas interpretation, and troubleshooting. Focus is placed on adult ICU management, lung protective strategies, and safe weaning.

Course Learning Objectives:
- Determine indications for invasive mechanical ventilation using clinical criteria.
- Select optimal initial ventilator settings (Volume Control, Pressure Control, rate, tidal volume, PEEP, FiO2).
- Interpret mechanical ventilator graphics (pressure-time, flow-time loops) to detect patient-ventilator asynchrony or airway obstruction.
- Analyze arterial blood gas (ABG) results to make appropriate ventilator parameter adjustments (adjusting rate, tidal volume, or pressure to fix respiratory acidosis/alkalosis).
- Safely troubleshoot ventilator alarms (high pressure, low pressure, disconnect) and patient distress.
- Execute weaning protocols based on readiness-to-wean assessment parameters.

Weekly Outline & Modules:
Module 1: Principles of Positive Pressure Ventilation
- Invasive vs. non-invasive ventilation indications and contraindications.

Module 2: Initial Setup and Modes
- Volume Control (VC-A/C) and Pressure Control (PC-A/C) settings.
- Patient-triggered vs. time-triggered breaths.

Module 3: Ventilator Graphics & Waveform Analysis
- Flow loops, auto-PEEP detection, secretions, and resistance.
- Patient-ventilator asynchrony assessment and treatment.

Module 4: Managing Acid-Base Imbalances (ABG Management)
- Correcting respiratory acidosis by adjusting respiratory rate or tidal volume.
- Management of alveolar hypoventilation and shunting.`
  },
  {
    name: "NBRC Clinical Simulation Exam Prep & Diagnostics",
    code: "RT 505",
    term: "Term 5",
    text: `Course Title: NBRC Clinical Simulation Exam Prep & Diagnostics (RT 505)
Course Description:
A capstone course preparing students for the National Board for Respiratory Care (NBRC) Clinical Simulation Examination (CSE). Advanced clinical scenarios focusing on patient data collection, diagnostic testing, therapeutic intervention selection, and decision-making in critical care, pediatrics, and outpatient clinics.

Course Learning Objectives:
- Collect relevant clinical information (physical exam, lab tests, hemodynamics, chest X-rays) to determine patient diagnosis.
- Interpret advanced diagnostic procedures including pulmonary function testing (PFT), capnography, and ECGs.
- Select appropriate therapeutic decisions under time pressure (medications, airway management, ventilator parameters).
- Evaluate patient response to interventions and decide whether to terminate, modify, or continue therapies.
- Apply NBRC clinical practice guidelines in emergency and home-care settings.

Weekly Outline & Modules:
Module 1: Capstone NBRC CSE Simulation Scenarios
- High-fidelity simulations mimicking board exam branching logic.
- Assessment vs. Decision-making scoring criteria.

Module 2: Advanced Patient Assessment & Chest Radiograph Interpretation
- Evaluating systemic hemodynamics: Swan-Ganz catheter readings, CVP, PCWP, Cardiac Index.
- Reading CXR patterns: ARDS, pneumothorax, pulmonary edema, pleural effusion.

Module 3: Terminate, Modify, or Continue Protocols
- Decision-making during dynamic bronchospasm, code blue, or accidental extubation.
- Outpatient management of COPD, Asthma, and cystic fibrosis.`
  }
];
