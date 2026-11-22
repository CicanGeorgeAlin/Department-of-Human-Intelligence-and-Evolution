# DHIE Stage Three — Strategy Simulation Architecture

**Working title:** DHIE: Director's Mandate  
**Project owner / player role:** Director Cican George Alin  
**Genre:** Single-player institutional strategy simulation  
**Hosting target:** GitHub Pages, as a separately routed experience at `/experience/` within this repository  
**Source of truth:** *The DHIE Protocols: A Manual for Humanity's Directed Evolution (Restricted Access)*, original 91-page PDF. The source PDF is not modified.

## 1. Product promise

The original manual and the game are two routes through the same fictional DHIE framework. Reading remains the canonical source text; the strategy simulation makes the framework experiential through decisions, trade-offs, institutional relationships and consequences.

The game must not replace, rewrite, or silently simplify the manual. Every playable chapter and learning objective will map to one or more numbered source sections. A coverage ledger will show which source sections are represented, tested, and still outstanding.

## 2. Player fantasy and framing

The player assumes the role of Director Cican George Alin and oversees the fictional institution described by the manual. The experience is explicitly framed as speculative fiction and a critical systems simulation. It does not present the manual's fictional technologies, historical claims, or coercive policies as real-world facts or recommendations.

The player is asked to reason about institutional power, uncertainty, resource allocation, human consequences, accountability, and unintended effects. Choices can expose tensions between the institution's stated goals and the harms or contradictions described in its own framework.

## 3. Source structure — campaign spine

The manual is organized into four parts and fourteen chapters. The campaign follows that source order:

### Part I — Foundations: The Imperative of Evolutionary Oversight
1. **The Genesis of Oversight — From Anarchy to Architects**
2. **Organizational Structure — The Labyrinth of Control**
3. **Methodologies and Data Acquisition — The Panopticon of Control**

### Part II — The Cognitive Realm: Shaping the Mind
4. **Cognitive Optimization Protocols (COPs) — Enhancing the Mind**
5. **Emotional Harmonization and Stability Protocols (EHSPs)**
6. **Creativity and Innovation Directives (CIDs)**
7. **Memory Calibration and Recall (MCRs) — The Curated Past**

### Part III — The Somatic Realm: Sculpting the Body
8. **Genetic Trajectory Management (GTMs)**
9. **Reproductive Oversight and Population Control (ROPCs)**
10. **Physiological Augmentation and Adaptation (PAAs)**

### Part IV — The Environmental Realm: Shaping the World
11. **Resource Allocation and Equity Frameworks (RAEFs)**
12. **Environmental Control and Habitat Engineering (ECHE)**
13. **Surveillance and Social Credit Systems (SSCS)**
14. **The Homo Optima and the Final Ascendance**

Chapter titles above are shortened where the PDF title wraps across lines; chapter numbers, acronyms, section labels and source wording must be checked against the PDF before final publication.

## 4. Core gameplay loop

Each chapter uses a repeatable loop:

1. **Briefing:** present the chapter's source-grounded context and relevant section references.
2. **Situation:** introduce a fictional institutional scenario derived from the chapter's subject matter.
3. **Decision:** the Director selects a policy, allocation, response, or oversight action.
4. **Consequences:** show immediate and delayed effects, affected stakeholders, uncertainty, and trade-offs.
5. **Debrief:** explain which source sections informed the scenario and distinguish explicit source content from game-design interpretation.
6. **Knowledge check:** test comprehension of the chapter's actual concepts and terminology.
7. **Archive unlock:** make the relevant chapter and section references available in the in-game archive.

No scenario, character, metric, or outcome should be described as a fact from the manual unless the PDF explicitly supports it. Game-only additions must be labelled as simulation design.

## 5. Strategy systems — proposed, not yet source-defined

The following are game mechanics to be designed and play-tested; they are not claimed to be official manual metrics:

- **Director's dashboard:** campaign status, active briefings, unresolved decisions and chapter coverage.
- **Resource ledger:** track scenario-specific allocations and constraints.
- **Institutional cohesion:** represent cooperation, conflict and internal tensions.
- **Public impact:** surface effects on people and communities represented in the scenario.
- **Evidence confidence:** distinguish well-supported information from incomplete or conflicting reports.
- **Accountability and legitimacy:** make oversight, consent, transparency and rights visible in the decision record.
- **Delayed consequences:** decisions can create later benefits, costs, feedback loops or unintended effects.

Avoid a single simplistic “good/evil” score. Use transparent consequence dimensions and explain how the simulation derives them.

## 6. Content architecture

Recommended data-first structure:

- `content/chapters.json` — 14 chapters, part membership, exact title, source page range, section IDs.
- `content/sections.json` — source section text or concise source-grounded summaries, references, terminology, coverage status.
- `content/scenarios.json` — game-only scenario briefs, decision options, consequences, and explicit source mappings.
- `content/assessments.json` — question bank mapped to section IDs and learning objectives.
- `content/terminology.json` — glossary entries using source terminology and documented inconsistencies.
- `engine/state.js` — deterministic campaign state and save/load model.
- `engine/rules.js` — transparent rules for applying choices and calculating consequences.
- `ui/` — briefing, dashboard, decision, debrief, archive and assessment views.

All content records should include provenance fields: `source_document`, `chapter_id`, `section_ids`, `source_page` where known, `content_type` (source or simulation), and `review_status`.

## 7. Progression and equivalence

The book and game should lead to the same **coverage outcome**, not necessarily identical wording or identical emotional experience.

- The book route covers every chapter and numbered section in the source.
- The game route must expose every chapter and account for every numbered section through a briefing, archive entry, decision context, debrief, or assessment.
- A section coverage matrix is the acceptance test. A chapter is not “complete” merely because its headline appeared.
- The final assessment samples the entire manual and reports coverage by chapter.
- The player can inspect source references at any point and return to the original reading experience.

## 8. Technical architecture

- Static, mobile-first web application hosted by GitHub Pages.
- Separate route and assets under `/experience/`; the existing homepage and 91-page source PDF remain intact.
- Vanilla HTML, CSS and JavaScript for a lightweight first release; no server or account required for the initial prototype.
- Save campaign state locally in the browser, with export/import of a JSON save file as a user-controlled backup.
- Deterministic game rules so the same save and decisions produce the same results.
- Accessible keyboard navigation, readable contrast, responsive layout, reduced-motion support and clear text alternatives.
- A visible link back to the main DHIE archive and a link from the main homepage into the experience.

## 9. Visual direction

Use the existing DHIE visual language: near-black interface, restrained white typography, cyan and magenta status accents, precise grid layouts, and a command-centre feel. Prioritize clarity and legibility over decorative effects. Avoid fake biometric gates or collecting sensitive personal data; any access-control styling is fictional atmosphere only.

## 10. Source-fidelity and editorial safeguards

- Preserve the original PDF unchanged.
- Do not invent missing source sections or silently repair numbering.
- Record source inconsistencies in an editorial issue log and present them transparently.
- Distinguish source-derived claims from game mechanics and interpretation.
- Do not treat fictional surveillance, memory alteration, genetic interventions, population controls or other coercive mechanisms as real-world instructions.
- Every scenario must have a traceable source mapping and editorial review.

## 11. Build milestones

1. **Architecture and source map:** confirm chapter/section inventory and source-page mapping.
2. **Vertical slice:** implement one complete chapter loop with briefing, decision, consequences, debrief and knowledge check.
3. **Engine foundation:** add deterministic state, save/load, dashboard and archive.
4. **Campaign content:** author scenarios and assessments across all 14 chapters.
5. **Coverage audit:** prove that every source section is represented in the game.
6. **Integration:** link the experience from the main DHIE homepage and add a return path.
7. **QA and release:** test mobile/desktop, accessibility, persistence, navigation, source citations and GitHub Pages deployment.

## 12. First vertical-slice recommendation

Start with **Chapter 1 — The Genesis of Oversight**. It introduces the fictional background, Great Stagnation/Regression, CICAN Doctrine, early iterations, global mandate, founding charter and core values. It is the most natural opening chapter for a Director-led strategy campaign.

Before implementation, verify exact subsection boundaries and page references against the PDF. The manual's own section numbering and any gaps or inconsistencies must remain visible in the source map.
