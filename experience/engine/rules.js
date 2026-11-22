import { normalizeState, switchChapter } from "./state.js";

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
