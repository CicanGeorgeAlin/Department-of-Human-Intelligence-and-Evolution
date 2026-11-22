import { normalizeState, switchChapter, createInitialChapterState, INITIAL_METRICS } from "./state.js";

export const DIMENSIONS = Object.freeze([
  "evidence_confidence",
  "accountability",
  "institutional_cohesion",
  "public_impact"
]);

export function applyDecision(currentState, option, chapterId = null) {
  if (!option || typeof option.id !== "string") {
    throw new Error("A valid decision option is required.");
  }
  let state = normalizeState(currentState);
  if (chapterId !== null && String(chapterId) !== state.campaign.chapterId) {
    state = switchChapter(state, chapterId);
  }
  const activeId = state.campaign.chapterId;
  if (state.chapter.decision) {
    if (state.chapter.decision === option.id) return state;
    throw new Error("A decision is already recorded for this chapter. Restart it before choosing again.");
  }
  for (const key of DIMENSIONS) {
    const delta = option.effects?.[key];
    if (!Number.isInteger(delta) || delta < -2 || delta > 2) {
      throw new Error("All four consequence dimensions require integer effects between -2 and +2.");
    }
    state.metrics[key] = Math.max(0, Math.min(10, state.metrics[key] + delta));
  }
  state.chapter.decision = option.id;
  state.chapter.selectedOptionId = option.id;
  state.decisionLog.push({
    chapterId: activeId,
    optionId: option.id,
    effects: Object.fromEntries(DIMENSIONS.map(key => [key, option.effects[key]]))
  });
  state.chapterProgress[activeId] = { ...state.chapter };
  return state;
}

export function setChapterProgress(currentState, patch = {}) {
  let state = normalizeState(currentState);
  if (patch.chapterId !== undefined && String(patch.chapterId) !== state.campaign.chapterId) {
    state = switchChapter(state, patch.chapterId);
  }
  const activeId = state.campaign.chapterId;
  if (Number.isInteger(patch.step)) state.chapter.step = Math.max(0, Math.min(5, patch.step));
  if (patch.selectedOptionId === null || typeof patch.selectedOptionId === "string") {
    state.chapter.selectedOptionId = patch.selectedOptionId;
  }
  if (patch.answers && typeof patch.answers === "object") {
    state.chapter.answers = { ...state.chapter.answers, ...patch.answers };
  }
  if (patch.assessmentSubmitted === true) state.chapter.assessmentSubmitted = true;
  if (Number.isInteger(patch.assessmentScore)) state.chapter.assessmentScore = patch.assessmentScore;
  if (Array.isArray(patch.unlockedSections)) {
    state.campaign.unlockedSections = [...new Set([...state.campaign.unlockedSections, ...patch.unlockedSections])];
  }
  if (patch.completed === true) {
    state.campaign.completedChapters = [...new Set([...state.campaign.completedChapters, activeId])];
  }
  state.chapterProgress[activeId] = { ...state.chapter, answers: { ...state.chapter.answers } };
  return state;
}

export function applyAssessment(currentState, questions, answers, chapterId = null) {
  let state = normalizeState(currentState);
  if (chapterId !== null && String(chapterId) !== state.campaign.chapterId) {
    state = switchChapter(state, chapterId);
  }
  const score = questions.reduce((sum, question) =>
    sum + (answers[question.id] === question.answer ? 1 : 0), 0);
  const sections = questions.flatMap(question => question.section_ids ?? question.sectionIds ?? []);
  state = setChapterProgress(state, {
    answers,
    assessmentSubmitted: true,
    assessmentScore: score,
    unlockedSections: sections,
    completed: true
  });
  return { state, score, total: questions.length };
}


/**
 * Restart one chapter without disturbing other chapters.
 * Campaign-wide metrics are replayed from the initial baseline so clamped
 * values are recalculated correctly; cumulative source unlocks are retained.
 */
export function restartChapter(currentState, chapterId = null) {
  let state = normalizeState(currentState);
  const targetId = chapterId === null ? state.campaign.chapterId : String(chapterId);
  if (!/^(?:[1-9]|1[0-4])$/.test(targetId)) {
    throw new Error("Chapter must be between 1 and 14.");
  }
  if (targetId !== state.campaign.chapterId) {
    state = switchChapter(state, targetId);
  }

  state.decisionLog = state.decisionLog.filter(entry => String(entry.chapterId) !== targetId);
  state.metrics = { ...INITIAL_METRICS };
  for (const entry of state.decisionLog) {
    const effects = entry.effects;
    if (!effects || DIMENSIONS.some(key =>
      !Number.isInteger(effects[key]) || effects[key] < -2 || effects[key] > 2
    )) continue;
    for (const key of DIMENSIONS) {
      state.metrics[key] = Math.max(0, Math.min(10, state.metrics[key] + effects[key]));
    }
  }

  state.chapter = createInitialChapterState();
  state.chapterProgress[targetId] = { ...state.chapter, answers: {} };
  state.campaign.completedChapters = state.campaign.completedChapters.filter(id => id !== targetId);
  // unlockedSections are cumulative archive discoveries and may be shared by
  // multiple chapters, so restarting one chapter does not revoke them.
  return state;
}
