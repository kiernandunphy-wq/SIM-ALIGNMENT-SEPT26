# ClassmateLR Syllabus-to-Simulation Alignment System
## Technical Codebase Documentation & Decision Tree Specification

This document provides a comprehensive technical guide to the files, architecture, and decision logic implemented within the ClassmateLR Syllabus-to-Simulation Alignment prototype. 

---

## 1. System & Directory Manifest

The application is structured as a full-stack Node.js and React application. Below is the detailed breakdown of what each file does across the codebase:

### Backend Architecture (`/server` & `/`)

#### 📄 `server/geminiProxy.mjs`
The backend API proxy server built on top of the native `node:http` module. It acts as the gatekeeper and document processor:
* **Asset Parsing**: Uses `mammoth` to extract text from Microsoft Word (`.docx`) files and `pdf-parse` to extract text from Adobe PDF (`.pdf`) documents.
* **API Key Guarding**: Ensures that the `GEMINI_API_KEY` remains strictly server-side, safeguarding it from browser inspection.
* **Gemini 2.5-Flash Schema Enforcement**: Leverages structured JSON outputs to ensure Gemini returns course titles, description, outcomes, and modules according to a strict TypeScript schema.
* **Deterministic Fallback Engine (`deterministicFallbackParse`)**: If Gemini fails to return JSON or returns an empty modules list, this engine intercepts the response. It runs a deterministic heuristic search on the raw syllabus text to extract structured modules from headers matching Course Content, Course Outline, Student Learning Outcomes, Learning Objectives, Weekly Schedule, or major topic lists. It builds and returns valid modules with `parserSource: "deterministic_text_fallback"` under HTTP 200 to prevent breaking failures.

#### 📄 `server/dev.mjs`
A developer-mode entry point that launches Vite's development middleware within the Express or native Node HTTP server pipeline, enabling rapid client/server local development.

---

### Client-Side Architecture (`/src`)

#### 📄 `src/App.tsx`
The primary Single Page Application user interface built in React:
* **Interactive State Control**: Manages user interactions for file uploads, manual overrides, and progress visualization.
* **Visual Program Alignment Board**: Displays cards for Terms 1–5 alongside warnings (e.g., low-confidence term mappings) to keep faculty in control.
* **Multi-Term Curriculum Report Generator**: Compiles aligned syllabi, mapped simulations, and warnings into a structured, responsive HTML layout ready for download or direct printing via `window.print`.

#### 📄 `src/types.ts`
The central type dictionary containing all TypeScript interfaces and type assertions:
* **Data Schemas**: Defines `UploadedSyllabus`, `ParsedSyllabus`, `ParsedSyllabusModule`, and `SimulationCatalogItem`.
* **Alignment Outputs**: Dictates the shape of `SimRecommendationResult` and `ProgramTermAlignment` to ensure runtime type-safety across client and server.

#### 📄 `src/services/decisionEngine.ts`
The core clinical mapping algorithm of the application. It contains the mathematical matching formulas and programmatic constraints used to link syllabus modules with appropriate simulations from `simCatalog.ts` (see Section 2).

#### 📄 `src/services/geminiService.ts`
A frontend wrapper service that initiates standard `fetch` POST requests to `/api/parse-syllabus` and `/api/extract-images`, handles network failures gracefully, and sanitizes API responses before updating the UI state.

#### 📄 `src/utils/termInference.ts`
A heuristic rule utility that detects which Program Term (1–5) a syllabus belongs to by analyzing filename tokens (e.g., `RT303` -> Term 3) and page content strings, outputting confidence levels (High, Medium, Low) and transparent reasonings.

#### 📄 `src/utils/text.ts`
Utility helper functions that clean up punctuation, normalize spacing, perform word-level tokenization, and compute text-overlap scoring metrics to identify clinical alignment keywords.

#### 📄 `src/data/simCatalog.ts`
A curated dictionary of clinical respiratory simulations, defining their name, description, therapeutic scope, targeted competencies, difficulty tier, and targeted Bloom levels.

---

## 2. Simulation Alignment Decision Tree Map

The alignment decision engine parses through every available simulation in the catalog for each syllabus module and filters/scores them using a multi-layered rule pipeline:

```
                  [ INPUT: Syllabus Module + Catalog Simulation ]
                                         │
                                         ▼
                      [ STEP 1: TERM RULE VALIDATION ]
                     Determine Program Term (e.g., Term 3)
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 ▼ (Term 1)              ▼ (Term 3)              ▼ (Term 5)
              Basic Only              Intermediate +          NBRC + Variable
            Blocked: Interm/          Faculty Bridge          All Allowed
            Adv/NBRC/Variable         Blocked: NBRC/Var
                 │                       │                       │
                 └───────────────────────┼───────────────────────┘
                                         ▼
                      [ STEP 2: DIFFICULTY STATUS CHECK ]
                     Does Sim Difficulty match Term allowances?
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 ▼ (Primary Allowed)                             ▼ (Review Allowed)
              e.g., Interm in Term 3                        e.g., Basic in Term 3
                 │                                               │
                 │                                               ▼
                 │                                   [ STEP 3: EXPOSURE MATCH ]
                 │                                 Check module.topicExposureStatus
                 │                                 Term 3 Review requires:
                 │                                 - review_reinforcement,
                 │                                 - builds_on_prior_sim, or
                 │                                 - remediation
                 │                                               │
                 │                                    ┌──────────┴──────────┐
                 │                                    ▼ (Pass)              ▼ (Fail)
                 ├────────────────────────────────────┘                  [ REJECT ]
                 ▼
       [ STEP 4: KEYWORD SCORING ]
       Calculate score:
       * Clinical Focus Keyword Matches:   +10 pts each (Max 30)
       * Objectives & Content Matches:     +9 pts each  (Max 25)
       * Therapies/Equip/Skills Matches:   +8 pts each  (Max 20)
       * Pathology Target Matches:         +10 pts each (Max 10)
       * Debrief focus Matches:            +3 pts each  (Max 5)
       * Bloom Taxonomy Level Aligns:       +10 pts
       * Optimal Term Tier Bonus:          +15 pts
                 │
                 ▼
       [ STEP 5: MEANINGFUL TOPIC FILTER ]
       Does module contain major keywords (abg, ventilat, oxygen, airway)?
       If NO and Score < 30:
                 │
                 ├──────────────────────────────┐
                 ▼ (Pass)                       ▼ (Fail)
              Keep Score                    [ REJECT (Score = 0) ]
                 │
                 ▼
       [ STEP 6: TOPIC-SPECIFIC BOOSTS ]
       * Gas exchange / Oxygen transport:  +20 pts
       * ABG / Acid-base balance:          +25 pts
       * Hemodynamics / Pressures / Vol:   +25 pts (or -15 penalty if non-hemodynamic)
       * Chest radiograph / CXR / X-Ray:   +20 pts
                 │
                 ▼
       [ STEP 7: CATALOG RANKING ]
       * Top matches sorted descending by score -> Recommended Simulations.
       * Excluded/blocked or lower-scoring matches -> Rejected Near Matches (with reasons).
```

---

## 3. Key Decision Engine Parameters & Thresholds

* **Optimal Difficulty Bonus**: If a simulation matches the term's optimal target difficulty (e.g., "Basic" for Term 1, "Intermediate" for Term 3, "Advanced" for Term 4, "NBRC" for Term 5), it receives an alignment score boost.
* **Exposure Restriction**: Early-tier simulations are blocked in late-tier terms unless the syllabus indicates they are meant for reinforcement/remediation, preventing over-assignment of redundant concepts.
* **Noise Filtering**: Modules with low relevance that do not contain major diagnostic keywords are scored at zero if they fall below a baseline threshold of 30, avoiding unrelated recommendations.
