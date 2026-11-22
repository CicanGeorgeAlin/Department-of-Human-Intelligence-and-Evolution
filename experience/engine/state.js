export const SAVE_KEY = "dhie-directors-mandate-save-v1";
export const SAVE_VERSION = 1;
export const TOTAL_CHAPTERS = 14;
export const INITIAL_METRICS = Object.freeze({
  evidence_confidence: 5,
  accountability: 5,
  institutional_cohesion: 5,
  public_impact: 5
});

export function createInitialChapterState() {
  return {
    step: 0,
    selectedOptionId: null,
    decision: null,
    answers: {},
    assessmentSubmitted: false,
    assessmentScore: null
  };
}

export function createInitialState() {
  return {
    version: SAVE_VERSION,
    campaign: { chapterId: "1", completedChapters: [], unlockedSections: [] },
    chapter: createInitialChapterState(),
    chapterProgress: { "1": createInitialChapterState() },
    metrics: { ...INITIAL_METRICS },
    decisionLog: [],
    updatedAt: null
  };
}

function normalizeChapterState(candidate) {
  const chapter = candidate && typeof candidate === "object" ? candidate : {};
  const step = Number.isInteger(chapter.step) ? Math.max(0, Math.min(5, chapter.step)) : 0;
  const answers = chapter.answers && typeof chapter.answers === "object"
    ? Object.fromEntries(Object.entries(chapter.answers).filter(([key, value]) =>
        /^q\d+$/.test(key) && Number.isInteger(value) && value >= 0 && value <= 10))
    : {};
  return {
    step,
    selectedOptionId: typeof chapter.selectedOptionId === "string" ? chapter.selectedOptionId : null,
    decision: typeof chapter.decision === "string" ? chapter.decision : null,
    answers,
    assessmentSubmitted: chapter.assessmentSubmitted === true,
    assessmentScore: Number.isInteger(chapter.assessmentScore) ? chapter.assessmentScore : null
  };
}

function validChapterId(value) {
  const id = String(value ?? "1");
  return /^(?:[1-9]|1[0-4])$/.test(id) ? id : "1";
}

export function normalizeState(candidate) {
  const base = createInitialState();
  if (!candidate || candidate.version !== SAVE_VERSION) return base;

  const chapterId = validChapterId(candidate.campaign?.chapterId);
  const metrics = { ...base.metrics };
  for (const key of Object.keys(metrics)) {
    const value = candidate.metrics?.[key];
    if (Number.isFinite(value)) metrics[key] = Math.max(0, Math.min(10, Math.round(value)));
  }

  const chapterProgress = {};
  if (candidate.chapterProgress && typeof candidate.chapterProgress === "object") {
    for (const [id, progress] of Object.entries(candidate.chapterProgress)) {
      if (/^(?:[1-9]|1[0-4])$/.test(id)) chapterProgress[id] = normalizeChapterState(progress);
    }
  }
  // Migrate existing v1 saves, which stored only the active chapter state.
  if (!chapterProgress[chapterId]) {
    chapterProgress[chapterId] = normalizeChapterState(candidate.chapter);
  }
  const chapter = normalizeChapterState(chapterProgress[chapterId]);
  chapterProgress[chapterId] = chapter;

  const log = Array.isArray(candidate.decisionLog)
    ? candidate.decisionLog.filter(entry =>
        entry && typeof entry.optionId === "string" &&
        /^(?:[1-9]|1[0-4])$/.test(String(entry.chapterId ?? "1"))
      ).slice(0, 500)
    : [];

  return {
    version: SAVE_VERSION,
    campaign: {
      chapterId,
      completedChapters: Array.isArray(candidate.campaign?.completedChapters)
        ? [...new Set(candidate.campaign.completedChapters.map(String).filter(id => /^(?:[1-9]|1[0-4])$/.test(id)))]
        : [],
      unlockedSections: Array.isArray(candidate.campaign?.unlockedSections)
        ? [...new Set(candidate.campaign.unlockedSections.filter(value => typeof value === "string"))]
        : []
    },
    chapter,
    chapterProgress,
    metrics,
    decisionLog: log,
    updatedAt: typeof candidate.updatedAt === "string" ? candidate.updatedAt : null
  };
}

export function switchChapter(currentState, chapterId) {
  const id = validChapterId(chapterId);
  if (String(chapterId) !== id) throw new Error("Chapter must be between 1 and 14.");
  const state = normalizeState(currentState);
  state.chapterProgress[state.campaign.chapterId] = normalizeChapterState(state.chapter);
  state.campaign.chapterId = id;
  state.chapter = normalizeChapterState(state.chapterProgress[id]);
  state.chapterProgress[id] = state.chapter;
  return state;
}

export function saveState(state, storage = globalThis.localStorage) {
  const safe = normalizeState(state);
  safe.chapterProgress[safe.campaign.chapterId] = normalizeChapterState(safe.chapter);
  safe.updatedAt = new Date().toISOString();
  storage.setItem(SAVE_KEY, JSON.stringify(safe));
  return safe;
}

export function loadState(storage = globalThis.localStorage) {
  try {
    const raw = storage.getItem(SAVE_KEY);
    return raw ? normalizeState(JSON.parse(raw)) : createInitialState();
  } catch {
    return createInitialState();
  }
}

export function exportSave(state) {
  return JSON.stringify({ format: "dhie-directors-mandate-save", ...normalizeState(state) }, null, 2);
}

export function importSave(text) {
  const parsed = JSON.parse(text);
  if (parsed?.format !== "dhie-directors-mandate-save") {
    throw new Error("This is not a Director's Mandate save file.");
  }
  if (parsed.version !== SAVE_VERSION) throw new Error("This save version is not supported.");
  return normalizeState(parsed);
}

export function resetSavedState(storage = globalThis.localStorage) {
  storage.removeItem(SAVE_KEY);
  return createInitialState();
}
