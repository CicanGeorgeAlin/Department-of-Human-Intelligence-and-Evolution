import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  createInitialState,
  normalizeState,
  switchChapter,
  saveState,
  loadState,
  exportSave,
  importSave
} from "../engine/state.js";
import {
  applyDecision,
  setChapterProgress,
  applyAssessment
} from "../engine/rules.js";
import {
  loadCampaignInventory,
  loadChapter,
  TOTAL_CHAPTERS
} from "../engine/content.js";

const root = process.cwd();
const fetcher = async path => {
  const file = resolve(root, path.replace(/^\.\//, ""));
  try {
    const content = await readFile(file, "utf8");
    return { ok: true, status: 200, json: async () => JSON.parse(content) };
  } catch {
    return { ok: false, status: 404, json: async () => null };
  }
};

test("campaign inventory declares fourteen chapters and 277 numbered headings", async () => {
  const inventory = await loadCampaignInventory(fetcher);
  assert.equal(inventory.verified_chapter_count, TOTAL_CHAPTERS);
  assert.equal(inventory.transcribed_numbered_heading_count, 277);
  assert.equal(inventory.chapter_titles.length, TOTAL_CHAPTERS);
});

test("all fourteen chapter records pass exact source and mechanics validation", async () => {
  const inventory = await loadCampaignInventory(fetcher);
  const chapters = await Promise.all(
    Array.from({ length: TOTAL_CHAPTERS }, (_, index) =>
      loadChapter(index + 1, fetcher, inventory))
  );
  assert.equal(chapters.length, 14);
  for (let index = 0; index < chapters.length; index += 1) {
    const chapter = chapters[index];
    const expected = inventory[`chapter_${index + 1}_sections`];
    assert.equal(chapter.chapter_id, String(index + 1));
    assert.equal(chapter.coverage.length, expected.length);
    assert.deepEqual(
      chapter.coverage.map(row => [row.section_id, row.title, String(row.source_page)]),
      expected.map(row => [row[0], row[1], String(row[2])])
    );
    assert.equal(chapter.assessment.length, 4);
    assert.equal(chapter.scenario.options.length, 3);
  }
});

test("chapter switching preserves independent answers and progress", () => {
  let state = createInitialState();
  state = setChapterProgress(state, { step: 2, answers: { q1: 1, q2: 0 } });
  state = switchChapter(state, "2");
  state = setChapterProgress(state, { step: 1, answers: { q1: 2 } });
  state = switchChapter(state, "1");
  assert.equal(state.chapter.step, 2);
  assert.deepEqual(state.chapter.answers, { q1: 1, q2: 0 });
  state = switchChapter(state, "2");
  assert.equal(state.chapter.step, 1);
  assert.deepEqual(state.chapter.answers, { q1: 2 });
});

test("decisions are chapter-scoped and cannot be applied twice", async () => {
  const chapter = await loadChapter(3, fetcher);
  const option = chapter.scenario.options[0];
  const state = applyDecision(createInitialState(), option, "3");
  assert.equal(state.chapter.decision, option.id);
  assert.equal(state.decisionLog.length, 1);
  assert.equal(state.decisionLog[0].chapterId, "3");
  assert.throws(() => applyDecision(state, chapter.scenario.options[1], "3"), /already recorded/);
});

test("assessment scoring unlocks only referenced sections and marks completion", async () => {
  const chapter = await loadChapter(13, fetcher);
  const answers = Object.fromEntries(chapter.assessment.map(question => [question.id, question.answer]));
  const result = applyAssessment(createInitialState(), chapter.assessment, answers, "13");
  assert.equal(result.score, 4);
  assert.equal(result.total, 4);
  assert.equal(result.state.chapter.assessmentScore, 4);
  assert.equal(result.state.chapter.assessmentSubmitted, true);
  assert.equal(result.state.campaign.completedChapters.includes("13"), true);
  const expectedSections = new Set(chapter.assessment.flatMap(question => question.section_ids));
  assert.deepEqual(new Set(result.state.campaign.unlockedSections), expectedSections);
});

test("save normalization retains q1–q4 answers and import/export round-trip", () => {
  const state = createInitialState();
  state.chapter.answers = { q1: 0, q2: 1, q3: 2, q4: 0 };
  state.chapterProgress["1"] = { ...state.chapter, answers: { ...state.chapter.answers } };
  const normalized = normalizeState(state);
  assert.deepEqual(normalized.chapter.answers, state.chapter.answers);
  const restored = importSave(exportSave(normalized));
  assert.deepEqual(restored.chapter.answers, state.chapter.answers);
  assert.equal(restored.campaign.chapterId, "1");
});

test("local storage adapter safely persists and restores a chapter save", () => {
  const storage = {
    value: null,
    getItem() { return this.value; },
    setItem(_key, value) { this.value = value; },
    removeItem() { this.value = null; }
  };
  let state = createInitialState();
  state = setChapterProgress(state, { step: 4, answers: { q1: 2, q2: 1 } });
  saveState(state, storage);
  const restored = loadState(storage);
  assert.equal(restored.chapter.step, 4);
  assert.deepEqual(restored.chapter.answers, { q1: 2, q2: 1 });
});
