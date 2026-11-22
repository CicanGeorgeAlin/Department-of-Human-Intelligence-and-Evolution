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
