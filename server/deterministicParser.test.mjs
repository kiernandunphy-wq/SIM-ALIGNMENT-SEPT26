import { test } from "node:test";
import assert from "node:assert/strict";
import { deterministicFallbackParse } from "./deterministicParser.mjs";

test("RCP 208 sample produces four grouped units", () => {
  const rcp208Text = `
Course Title: RCP208 Advanced Critical Care
Unit 1: Hemodynamic Monitoring and Assessment
• Define cardiac output and systemic vascular resistance.
• Explain pulmonary artery catheter waveforms.
• Calculate cardiac index from patient parameters.

Unit 2: Advanced Mechanical Ventilation Modes
• Identify indications for APRV and NAVA.
• Describe ventilator dyssynchrony management.
• Calculate oxygenation index.

Unit 3: Neonatal and Pediatric Critical Care
• Demonstrate surfactant administration protocol.
• Evaluate high-frequency oscillatory ventilation parameters.

Unit 4: Critical Care Pharmacology and Resuscitation
• Describe vasoactive and inotropic medication indications.
• Demonstrate ACLS airway management algorithms.
`;

  const result = deterministicFallbackParse(rcp208Text);

  assert.equal(result.courseCode, "RCP 208");
  assert.equal(result.modules.length, 4, `Expected 4 units, got ${result.modules.length}`);
  assert.equal(result.modules[0].weekOrModule, "Unit 1");
  assert.ok(result.modules[0].learningObjectives.length >= 3);
  assert.equal(result.modules[1].weekOrModule, "Unit 2");
  assert.equal(result.modules[2].weekOrModule, "Unit 3");
  assert.equal(result.modules[3].weekOrModule, "Unit 4");
});

test("RCP 206 sample produces grouped chapters rather than individual objective modules", () => {
  const rcp206Text = `
Course: RCP206 Respiratory Care Pharmacology
Chapter 1: Principles of Pharmacology
• Define pharmacokinetics and pharmacodynamics.
• Explain half-life and therapeutic index.
• Describe routes of drug administration.

Chapter 2: Bronchodilator Agents
• Identify sympathomimetic and anticholinergic bronchodilators.
• Compare short-acting and long-acting beta agonists.
• Demonstrate proper MDI and DPI administration techniques.

Chapter 3: Mucolytic and Corticosteroid Therapies
• Describe mechanisms of mucolytic agents.
• Outline indications for inhaled corticosteroids.
• Identify potential side effects of aerosolized steroids.
`;

  const result = deterministicFallbackParse(rcp206Text);

  assert.equal(result.courseCode, "RCP 206");
  assert.equal(result.modules.length, 3, `Expected 3 chapters, got ${result.modules.length}`);
  assert.equal(result.modules[0].weekOrModule, "Chapter 1");
  assert.equal(result.modules[0].learningObjectives.length, 3);
  assert.equal(result.modules[1].weekOrModule, "Chapter 2");
  assert.equal(result.modules[1].learningObjectives.length, 3);
  assert.equal(result.modules[2].weekOrModule, "Chapter 3");
  assert.equal(result.modules[2].learningObjectives.length, 3);
});
