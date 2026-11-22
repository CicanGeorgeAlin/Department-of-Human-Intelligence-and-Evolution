import { normalizeState } from "./state.js";
const DIMENSIONS = ["evidence_confidence", "accountability", "institutional_cohesion", "public_impact"];

export function applyDecision(currentState, option) {
  if (!option || typeof option.id !== "string") throw new Error("A valid decision option is required.");
  const state = normalizeState(currentState);
  if (state.chapter.decision) {
    if (state.chapter.decision === option.id) return state;
    throw new Error("A decision is already recorded. Restart the chapter before choosing again.");
  }
  for (const key of DIMENSIONS) {
    const delta = option.effects?.[key];
    if (!Number.isInteger(delta)) throw new Error("All four consequence dimensions require integer effects.");
    state.metrics[key] = Math.max(0, Math.min(10, state.metrics[key] + delta));
  }
  state.chapter.decision = option.id;
  state.chapter.selectedOptionId = option.id;
  state.decisionLog.push({ chapterId: "1", optionId: option.id, effects: Object.fromEntries(DIMENSIONS.map(key => [key, option.effects[key]])) });
  return state;
}
export function setChapterProgress(currentState, patch) {
  const state = normalizeState(currentState);
  if (Number.isInteger(patch.step)) state.chapter.step = Math.max(0, Math.min(5, patch.step));
  if (patch.selectedOptionId === null || typeof patch.selectedOptionId === "string") state.chapter.selectedOptionId = patch.selectedOptionId;
  if (patch.answers && typeof patch.answers === "object") state.chapter.answers = { ...state.chapter.answers, ...patch.answers };
  if (patch.assessmentSubmitted === true) state.chapter.assessmentSubmitted = true;
  if (Number.isInteger(patch.assessmentScore)) state.chapter.assessmentScore = patch.assessmentScore;
  if (Array.isArray(patch.unlockedSections)) state.campaign.unlockedSections = [...new Set([...state.campaign.unlockedSections, ...patch.unlockedSections])];
  if (patch.completed === true) state.campaign.completedChapters = [...new Set([...state.campaign.completedChapters, "1"])];
  return state;
}
export function applyAssessment(currentState, questions, answers) {
  const score = questions.reduce((sum, q) => sum + (answers[q.id] === q.answer ? 1 : 0), 0);
  return { state: setChapterProgress(currentState, { answers, assessmentSubmitted: true, assessmentScore: score, unlockedSections: questions.flatMap(q => q.sectionIds ?? []) }), score, total: questions.length };
}
