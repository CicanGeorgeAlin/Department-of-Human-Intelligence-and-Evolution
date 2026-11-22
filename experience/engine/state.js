export const SAVE_KEY = "dhie-directors-mandate-save-v1";
export const SAVE_VERSION = 1;
export const INITIAL_METRICS = Object.freeze({ evidence_confidence: 5, accountability: 5, institutional_cohesion: 5, public_impact: 5 });

export function createInitialState() {
  return {
    version: SAVE_VERSION,
    campaign: { chapterId: "1", completedChapters: [], unlockedSections: [] },
    chapter: { step: 0, selectedOptionId: null, decision: null, answers: {}, assessmentSubmitted: false, assessmentScore: null },
    metrics: { ...INITIAL_METRICS },
    decisionLog: [],
    updatedAt: null
  };
}

export function normalizeState(candidate) {
  const base = createInitialState();
  if (!candidate || candidate.version !== SAVE_VERSION) return base;
  const metrics = { ...base.metrics };
  for (const key of Object.keys(metrics)) {
    const value = candidate.metrics?.[key];
    if (Number.isFinite(value)) metrics[key] = Math.max(0, Math.min(10, Math.round(value)));
  }
  const chapter = candidate.chapter ?? {};
  const step = Number.isInteger(chapter.step) ? Math.max(0, Math.min(5, chapter.step)) : 0;
  const answers = chapter.answers && typeof chapter.answers === "object"
    ? Object.fromEntries(Object.entries(chapter.answers).filter(([k,v]) => /^q\d+$/.test(k) && Number.isInteger(v) && v >= 0 && v <= 10))
    : {};
  const log = Array.isArray(candidate.decisionLog) ? candidate.decisionLog.filter(x => x && typeof x.optionId === "string").slice(0,100) : [];
  return {
    version: SAVE_VERSION,
    campaign: {
      chapterId: "1",
      completedChapters: Array.isArray(candidate.campaign?.completedChapters) ? [...new Set(candidate.campaign.completedChapters.filter(x => typeof x === "string"))] : [],
      unlockedSections: Array.isArray(candidate.campaign?.unlockedSections) ? [...new Set(candidate.campaign.unlockedSections.filter(x => typeof x === "string"))] : []
    },
    chapter: {
      step,
      selectedOptionId: typeof chapter.selectedOptionId === "string" ? chapter.selectedOptionId : null,
      decision: typeof chapter.decision === "string" ? chapter.decision : null,
      answers,
      assessmentSubmitted: chapter.assessmentSubmitted === true,
      assessmentScore: Number.isInteger(chapter.assessmentScore) ? chapter.assessmentScore : null
    },
    metrics, decisionLog: log,
    updatedAt: typeof candidate.updatedAt === "string" ? candidate.updatedAt : null
  };
}

export function saveState(state, storage = globalThis.localStorage) {
  const safe = normalizeState(state);
  safe.updatedAt = new Date().toISOString();
  storage.setItem(SAVE_KEY, JSON.stringify(safe));
  return safe;
}
export function loadState(storage = globalThis.localStorage) {
  try { const raw = storage.getItem(SAVE_KEY); return raw ? normalizeState(JSON.parse(raw)) : createInitialState(); }
  catch { return createInitialState(); }
}
export function exportSave(state) {
  return JSON.stringify({ format: "dhie-directors-mandate-save", ...normalizeState(state) }, null, 2);
}
export function importSave(text) {
  const parsed = JSON.parse(text);
  if (parsed?.format !== "dhie-directors-mandate-save") throw new Error("This is not a Director's Mandate save file.");
  if (parsed.version !== SAVE_VERSION) throw new Error("This save version is not supported.");
  return normalizeState(parsed);
}
export function resetSavedState(storage = globalThis.localStorage) {
  storage.removeItem(SAVE_KEY);
  return createInitialState();
}
