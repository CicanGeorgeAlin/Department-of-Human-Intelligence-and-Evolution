# DHIE Stage Three — Continue Autopilot

## Purpose
This document defines the repeatable operating protocol for developing **DHIE: Director's Mandate**, the strategy simulation based on the original 91-page DHIE manual.

## User command
When the user says **Continue** in this project, advance the next unfinished checkpoint in the sequence below. Do not ask the user to restate the project brief or repeat confirmed decisions.

## Locked decisions
- Genre: strategy simulation.
- Player perspective: Director Cican George Alin.
- Source of truth: original 91-page PDF, preserved unchanged.
- Campaign: all 14 chapters in their original four-part order.
- Platform: GitHub Pages.
- Game is a separate experience connected to the main DHIE site.
- Distinguish source-derived material from game-created scenarios and mechanics.
- Treat the manual as a fictional framework; do not present its fictional claims or coercive policies as real-world facts or recommendations.

## Continue protocol
For every user-issued **Continue**:

1. Inspect the current repository state and the latest project checkpoint before editing.
2. Identify the single next unfinished milestone; preserve completed work.
3. Reopen and inspect the relevant portions of the original PDF whenever source wording, chapter structure, subsection numbering, or source coverage is needed.
4. Work in a small, reviewable unit. Prefer a single chapter or engine component per checkpoint.
5. Implement the work in the repository when the required source evidence and technical inputs are available.
6. Run appropriate checks: source-section coverage, duplicate IDs, valid JSON, internal links, navigation, deterministic game rules, accessibility basics, and mobile layout as relevant.
7. Commit only changes that pass the applicable checks. Never claim an unperformed check passed.
8. Report the exact work completed, files changed, commit, test results, unresolved issues, and the next checkpoint.
9. Stop and wait for the next **Continue**. Do not skip unresolved blockers or silently invent missing source material.

## Milestone sequence
- **M0 — Source inventory:** verify all four parts, 14 chapter titles, every numbered heading/subsection, and page references from the PDF. Record gaps and source inconsistencies without repairing them.
- **M1 — Chapter 1 vertical slice:** source map, briefing, strategy situation, meaningful decision options, transparent consequences, debrief, and knowledge check.
- **M2 — Core simulation engine:** deterministic state model, resource ledger, consequence rules, save/restore, and campaign progression.
- **M3 — Command interface:** Director dashboard, campaign map, chapter archive, decision interface, and status/debrief screens.
- **M4 — Chapters 2–4:** complete source-mapped campaign content and assessments.
- **M5 — Chapters 5–7:** complete source-mapped campaign content and assessments.
- **M6 — Chapters 8–10:** complete source-mapped campaign content and assessments.
- **M7 — Chapters 11–14:** complete source-mapped campaign content and assessments.
- **M8 — Coverage audit:** demonstrate that every source numbered section is represented in the game and traceable to the book.
- **M9 — Integration:** add navigation from the main DHIE homepage to the game and a return link from the game to the archive.
- **M10 — QA and release:** test desktop/mobile layouts, navigation, persistence, accessibility, source references, game logic, and GitHub Pages deployment.

Milestones may be split into smaller checkpoints. The sequence is a dependency plan, not a promise that all work can be completed in one turn.

## Completion criteria
Stage Three is complete only when:
- all 14 chapters and all numbered source sections are mapped and represented;
- the campaign is playable from beginning to end;
- game mechanics are deterministic and documented;
- save/restore and navigation work;
- book/game coverage equivalence is evidenced by a coverage report;
- source fidelity and editorial caveats are preserved;
- the main site links to the game and the game links back;
- automated/static checks and real browser tests are reported accurately;
- the production deployment is confirmed successful.

## Important limits
“Autopilot” means the assistant advances one verified development checkpoint whenever the user says **Continue**. It does not mean work continues in the background between messages. If a step requires a decision, missing source material, credentials, or an external action, stop and ask only for that blocker.


## Verified progress log

- **M0 — Source inventory:** complete. All 14 chapters and 277 numbered headings are mapped to physical PDF pages in `content/source-inventory.json`.
- **M1 — Chapter 1 vertical slice:** implemented as the first playable prototype in `index.html`, with structured source-mapped content in `content/chapter-01.json`. Includes briefing, fictional decision situation, three choices, transparent game-only consequence dimensions, source-linked debrief, four-question knowledge check, and a 21-section coverage archive.
- **M1 limitations still open:** browser/device testing and visual QA have not yet been performed; progress persistence is not implemented (scheduled for M2); the homepage link into the experience is not yet integrated (M9).


- **M2 — Core simulation engine (first implementation):** added `engine/state.js` with versioned campaign state, normalization, local save/load, JSON export/import and reset; added `engine/rules.js` with bounded deterministic decision effects, duplicate-decision protection, chapter progress and assessment scoring; connected the Chapter 1 interface to these modules and added save export/import controls.
- **M2 checks:** fetched all four relevant files after commit; confirmed module imports/exports, versioned state, local storage read/write, backup import/export, reset, deterministic bounded effects, duplicate-decision guard, assessment scoring, and 21-section coverage. These were static source checks only.
- **M2 limitations still open:** no live browser/Android test has been run; localStorage behavior, module loading on GitHub Pages, save-file round-trip and cross-device import still require browser verification. The engine currently supports the Chapter 1 vertical slice, not the full 14-chapter campaign.


- **M3 — Director's command interface (first implementation):** added a campaign overview before the Chapter 1 experience, with four source-ordered part groups, all 14 chapter titles, heading counts from the verified inventory, playable/locked labels, a Chapter 1 launch/resume action, a return-to-overview control, and a completed-chapter counter. Updated the Chapter 1 archive message to accurately describe local save behavior.
- **M3 checks:** fetched the dashboard, inventory, engine modules and progress file after the implementation. Parsed the embedded campaign map and verified all 14 chapter titles and each chapter's section count against source-inventory.json; confirmed 277 total headings, four part groupings, only Chapter 1 marked playable, remaining chapters marked not yet playable, dashboard navigation, completion counter and retained save/import/export controls. All 14 static checks passed.
- **M3 limitations still open:** no live browser or Android visual/interaction test has been performed; no full DOM/accessibility audit has been run. The dashboard is a navigation shell, not a playable 14-chapter campaign. Homepage-to-game integration remains scheduled for M9.


- **M4 — Chapter 2 source-mapped content prepared:** reopened the original PDF at physical pages 9–14 and checked the chapter's opening, organizational hierarchy, five core divisions, regional bureaus/field operatives, and ICD-7 sections. Added `content/chapter-02.json` with a source-derived briefing, critical-reading note, source terminology, a clearly labelled fictional governance scenario, three game-only decision options and effects, four knowledge-check questions, and coverage rows for all 18 numbered headings.
- **Chapter 2 checks:** parsed the committed JSON and compared every section ID, exact heading title and page reference against the verified source inventory. Confirmed 18 unique coverage rows, four valid assessment questions with valid section references, three options with all four integer consequence dimensions, and explicit fictional-source/simulation framing. All 15 static checks passed.
- **Chapter 2 integration status:** content is prepared and source-checked, but is not yet playable from the campaign dashboard. The current UI and save-state model remain Chapter 1-specific; do not mark Chapter 2 as playable until chapter selection, state isolation and rendering are integrated and tested.


- **M4 — Chapter 3 source-mapped content prepared:** reopened the original PDF at physical pages 15–22 and checked the chapter opening, Global Surveillance Grids, biometric/cognitive/behavioral data systems, predictive analytics, covert operations, Evolutionary Index, Oracle and Minerva, and the transition into Chapter 4. Added `content/chapter-03.json` with a source-derived briefing, critical-reading note, five structural summaries, seven terminology entries, a clearly labelled fictional score-appeal scenario, three game-only decision options/effects, four knowledge-check questions, and coverage rows for all 21 numbered headings.
- **Chapter 3 checks:** parsed the committed JSON and compared every section ID, exact heading title and page reference against `source-inventory.json`; confirmed 21 unique coverage rows, four valid assessment questions with valid section references, three options with all four bounded integer consequence dimensions, and explicit fictional-source/simulation framing. All 9 static checks passed.
- **Chapter 3 integration status:** content is prepared and source-checked, but is not yet playable from the campaign dashboard. Chapter selection, state isolation and multi-chapter rendering remain unimplemented; do not mark Chapter 3 playable until integrated and tested.


- **M4 — Chapter 4 source-mapped content prepared:** reopened the original PDF at physical pages 22–29 and checked the chapter opening, neuro-augmentation, synaptic pruning and rewiring, Accelerated Learning Modules, Dream State Programming, Project Chimera, Subject Alpha-7, cognitive drift, and the transition into Chapter 5. Added `content/chapter-04.json` with a source-derived briefing, critical-reading note, five structural summaries, seven terminology entries, a clearly labelled fictional consent-and-safety scenario, three game-only decision options/effects, four knowledge-check questions, and coverage rows for all 21 numbered headings. Preserved the source-title discrepancy: the inventory lists “Enhancing the Mind” while the printed Chapter 4 heading on PDF page 22 says “Enhancing the Cortex.”
- **Chapter 4 checks:** parsed the committed JSON and compared every section ID, exact heading title and page reference against `source-inventory.json`; confirmed 21 unique coverage rows, four valid assessment questions with valid section references, three options with all four bounded integer consequence dimensions, and explicit fictional-source/simulation framing. All 9 static checks passed.
- **Chapter 4 integration status:** content is prepared and source-checked, but is not yet playable from the campaign dashboard. Chapter selection, state isolation and multi-chapter rendering remain unimplemented; do not mark Chapter 4 playable until integrated and tested.


- **M5 — Chapter 5 source-mapped content prepared:** reopened the original PDF at physical pages 29–35 and checked the chapter opening, Affective Damping, Empathy Amplification, Emotional Resilience Training, Bio-Chemical Regulation, the Consciousness Matrix, and the transition into Chapter 6. Added `content/chapter-05.json` with a source-derived briefing, critical-reading note, five structural summaries, seven terminology entries, a clearly labelled fictional emotional-wellbeing governance scenario, three game-only decision options/effects, four knowledge-check questions, and coverage rows for all 20 numbered headings. Preserved the title distinction: the inventory title is “Emotional Harmonization and Stability Protocols (EHSPs)”; the printed page 29 heading adds “– Engineering Empathy.”
- **Chapter 5 checks:** parsed the committed JSON and compared every section ID, exact heading title and page reference against `source-inventory.json`; confirmed 20 unique coverage rows, four valid assessment questions with valid section references, three options with all four bounded integer consequence dimensions, and explicit fictional-source/simulation framing. All 9 static checks passed.
- **Chapter 5 integration status:** content is prepared and source-checked, but is not yet playable from the campaign dashboard. Chapter selection, state isolation and multi-chapter rendering remain unimplemented; do not mark Chapter 5 playable until integrated and tested.


- **M5 — Chapter 6 source-mapped content prepared:** reopened the original PDF at physical pages 35–42 and checked the chapter opening, heuristic optimization, deductive/inductive reasoning, strategic scenario planning, divergent-thinking constraints, the innovation bottleneck, sanctioned R&D, Idea Incubation Zones, Nexus Think-Tanks, simulated problem-solving environments, seeding innovation, artistic expression frameworks, narrative control, and the three claimed DHIE-guided breakthroughs. Added `content/chapter-06.json` with a source-derived briefing, critical-reading note, five structural summaries, nine terminology entries, a clearly labelled fictional open-research governance scenario, three game-only decision options/effects, four knowledge-check questions, and coverage rows for all 20 numbered headings.
- **Chapter 6 checks:** parsed the committed JSON; compared all 20 section IDs, exact heading titles and page references against `source-inventory.json`; confirmed 20 unique coverage rows, four valid assessment questions with valid section references, three options with all four bounded integer consequence dimensions, and explicit fictional-source/simulation framing. All 10 static checks passed.
- **Chapter 6 integration status:** content is prepared and source-checked, but is not yet playable from the campaign dashboard. Chapter selection, state isolation and multi-chapter rendering remain unimplemented; do not mark Chapter 6 playable until integrated and tested.


- **M6 — Chapter 7 source-mapped content prepared:** reopened the original PDF at physical pages 42–48 and checked the chapter opening, targeted amnesia, trauma and dissenting-event erasure, the Blank Slate concept, memory implantation, fabricated historical narratives, childhood memory claims, collective nostalgia, archival revision, public-record management, propaganda and counter-narrative suppression, Personal Chronological Integration, Reality Consensus, and the chapter's concluding identity-reassignment claims. Added `content/chapter-07.json` with a source-derived briefing, critical-reading note, five structural summaries, ten terminology entries, a clearly labelled fictional archive-governance scenario, three game-only decision options/effects, four knowledge-check questions, and coverage rows for all 20 numbered headings.
- **Chapter 7 checks:** parsed the committed JSON; compared all 20 section IDs, exact heading titles and page references against `source-inventory.json`; confirmed 20 unique coverage rows, four valid assessment questions with valid section references, three options with all four bounded integer consequence dimensions, and explicit fictional-source/simulation framing. All 10 static checks passed.
- **Chapter 7 integration status:** content is prepared and source-checked, but is not yet playable from the campaign dashboard. Chapter selection, state isolation and multi-chapter rendering remain unimplemented; do not mark Chapter 7 playable until integrated and tested.


- **M7 — Chapter 8 source-mapped content prepared:** reopened the original PDF at physical pages 49–55 and checked the chapter opening, prenatal genetic screening and selection, authorized breeding, CRISPR-Cas9 claims, epigenetic conditioning, somatic augmentation, cybernetic integration, regenerative medicine, the Apex Body project, longevity claims, theoretical Digital Consciousness Transfer, and all three case studies. Added `content/chapter-08.json` with a source-derived briefing, critical-reading note, six structural summaries, eleven terminology entries, a clearly labelled fictional human-rights and research-governance scenario, three game-only decision options/effects, four knowledge-check questions, and coverage rows for all 24 numbered headings.
- **Chapter 8 checks:** parsed the committed JSON; compared all 24 section IDs, exact heading titles and page references against `source-inventory.json`; confirmed 24 unique coverage rows, four valid assessment questions with valid section references, three options with all four bounded integer consequence dimensions, and explicit fictional-source/simulation framing. All 10 static checks passed.
- **Chapter 8 integration status:** content is prepared and source-checked, but is not yet playable from the campaign dashboard. Chapter selection, state isolation and multi-chapter rendering remain unimplemented; do not mark Chapter 8 playable until integrated and tested.


- **M8 — Chapter 9 source-mapped content prepared:** reopened the original PDF at physical pages 56–62 and checked reproductive eligibility assessments, breeding permits and genetic matching, birth quotas, fertility management and sterilization, resource-based population measures, collective child-rearing, childhood conditioning, vocational assignment, family redefinition, dissolution of non-compliant units, and all three ROPC case files. Added `content/chapter-09.json` with a source-derived briefing, critical-reading note, five structural summaries, thirteen terminology entries, a clearly labelled fictional family-rights tribunal scenario, three game-only decision options/effects, four knowledge-check questions, and coverage rows for all 20 numbered headings.
- **Chapter 9 checks:** parsed the committed JSON; compared all 20 section IDs, exact heading titles and page references against `source-inventory.json`; confirmed 20 unique coverage rows, four valid assessment questions with valid section references, three options with all four bounded integer consequence dimensions, and explicit fictional-source/simulation framing. All static checks passed.
- **Chapter 9 integration status:** content is prepared and source-checked, but is not yet playable from the campaign dashboard. Chapter selection, state isolation and multi-chapter rendering remain unimplemented; do not mark Chapter 9 playable until integrated and tested.


- **M9 — Chapter 10 source-mapped content prepared:** reopened the original PDF at physical pages 62–68 and checked nanobot integration, cellular repair, targeted pharmaceutical delivery, physiological micro-sensors, organ and system enhancement, environmental adaptation, circadian synchronization, pain-threshold adjustment, sub-sensory conditioning, and the Atlas Cohort, Project Sentinel and Silent Adaptation case files. Added `content/chapter-10.json` with a source-derived briefing, critical-reading note, five structural summaries, thirteen terminology entries, a clearly labelled fictional augmentation-oversight scenario, three game-only decision options/effects, four knowledge-check questions, and coverage rows for all 20 numbered headings.
- **Chapter 10 checks:** parsed the committed JSON; compared all 20 section IDs, exact heading titles and page references against `source-inventory.json`; confirmed 20 unique coverage rows, four valid assessment questions with valid section references, three options with all four bounded integer consequence dimensions, and explicit fictional-source/simulation framing. All static checks passed.
- **Chapter 10 integration status:** content is prepared and source-checked, but is not yet playable from the campaign dashboard. Chapter selection, state isolation and multi-chapter rendering remain unimplemented; do not mark Chapter 10 playable until integrated and tested.


- **M10 — Chapter 11 source-mapped content prepared:** reopened the original PDF at physical pages 69–74 and checked centralized resource management, the Universal Resource Ledger, automated supply chains, strategic reserves, performance-based access tiers, Service Credits and Resource Allocation Scores, managed consumption, ecological management, climate regulation, bio-engineered ecosystems, geo-spatial redesign, circular-economy claims, energy recovery, and all three RAEF case files. Added `content/chapter-11.json` with a source-derived briefing, critical-reading note, five structural summaries, sixteen terminology entries, a clearly labelled fictional commons-allocation scenario, three game-only decision options/effects, four knowledge-check questions, and coverage rows for all 20 numbered headings.
- **Chapter 11 checks:** parsed the committed JSON; compared all 20 section IDs, exact heading titles and page references against `source-inventory.json`; confirmed 20 unique coverage rows, four valid assessment questions with valid section references, three options with all four bounded integer consequence dimensions, and explicit fictional-source/simulation framing. All static checks passed.
- **Chapter 11 integration status:** content is prepared and source-checked, but is not yet playable from the campaign dashboard. Chapter selection, state isolation and multi-chapter rendering remain unimplemented; do not mark Chapter 11 playable until integrated and tested.


- **M11 — Chapter 12 source-mapped content prepared:** reopened the original PDF at physical pages 75–80 and checked atmospheric filtration, stratospheric aerosol injection, hydrological and precipitation management, geological and seismic intervention claims, geothermal extraction, coastline redesign, engineered ecosystems, wilderness automation, ecological restoration, bio-integrated architecture, psycho-environmental conditioning, personal habitat calibration, and all three ECHE case files. Added `content/chapter-12.json` with a source-derived briefing, critical-reading note, five structural summaries, sixteen terminology entries, a clearly labelled fictional planetary-stewardship scenario, three game-only decision options/effects, four knowledge-check questions, and coverage rows for all 20 numbered headings.
- **Chapter 12 checks:** parsed the committed JSON; compared all 20 section IDs, exact heading titles and page references against `source-inventory.json`; confirmed 20 unique coverage rows, four valid assessment questions with valid section references, three options with all four bounded integer consequence dimensions, and explicit fictional-source/simulation framing. All static checks passed.
- **Chapter 12 integration status:** content is prepared and source-checked, but is not yet playable from the campaign dashboard. Chapter selection, state isolation and multi-chapter rendering remain unimplemented; do not mark Chapter 12 playable until integrated and tested.


- **M12 — Chapter 13 source-mapped content prepared:** reopened the original PDF at physical pages 81–87 and checked ubiquitous biometric and neural monitoring, optic/audio surveillance networks, physiological and movement tracking, social-credit scoring and access penalties, curated information and ideological education, counter-narrative suppression, automated behavior interventions, field operative deployment, identity-erasing re-patterning, and all three SSCS case files. Added `content/chapter-13.json` with a source-derived briefing, critical-reading note, five structural summaries, seventeen terminology entries, a clearly labelled fictional independent-oversight tribunal scenario, three game-only decision options/effects, four knowledge-check questions, and coverage rows for all 20 numbered headings.
- **Chapter 13 checks:** parsed the committed JSON; compared all 20 section IDs, exact heading titles and page references against `source-inventory.json`; confirmed 20 unique coverage rows, four valid assessment questions with valid section references, three options with all four bounded integer consequence dimensions, and explicit fictional-source/simulation framing. All static checks passed.
- **Chapter 13 integration status:** content is prepared and source-checked, but is not yet playable from the campaign dashboard. Chapter selection, state isolation and multi-chapter rendering remain unimplemented; do not mark Chapter 13 playable until integrated and tested.
