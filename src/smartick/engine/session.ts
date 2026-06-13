import type {
  SkillMap,
  SessionState,
  SessionResult,
  ProblemResult,
  Phase,
  SkillId,
} from "./types";
import { PHASES } from "./types";
import { SKILL_DEFINITIONS } from "./skill-map";

/** Total session duration in seconds (15 min). */
export const SESSION_DURATION_SECONDS = 900;
/** Warm-up phase duration in seconds (2 min). */
export const WARMUP_DURATION_SECONDS = 120;
/** Core phase duration in seconds (10 min). */
export const CORE_DURATION_SECONDS = 600;
/** Cool-down phase duration in seconds (3 min). */
export const COOLDOWN_DURATION_SECONDS = 180;
/** Minimum cool-down time in seconds. */
export const MIN_COOLDOWN_SECONDS = 30;
/** Maximum consecutive errors before hard stop. */
export const HARD_STOP_CONSECUTIVE_ERRORS = 10;

/**
 * Create a fresh initial session state.
 *
 * @param _skillMap - Skill map (reserved for future warm-up queue prefill)
 * @returns A new SessionState in warm-up phase
 */
export function createInitialSession(_skillMap: SkillMap): SessionState {
  return {
    active: true,
    phase: PHASES.WARM_UP,
    elapsedSeconds: 0,
    currentStreak: 0,
    maxStreak: 0,
    starsEarned: 0,
    problemsAnswered: 0,
    currentProblemIndex: 0,
    problemQueue: [],
    results: [],
    startTime: new Date().toISOString(),
  };
}

/**
 * Apply a problem result to the session state and return the new state.
 *
 * This is a pure function — the original session is NOT mutated.
 *
 * @param state - Current session state
 * @param result - The problem result (problem solved + correctness + response time)
 * @returns New session state with the result applied
 */
export function applyResult(
  state: SessionState,
  result: ProblemResult,
): SessionState {
  const newStreak = result.isCorrect ? state.currentStreak + 1 : 0;

  // Stars from tier: tier-1 = 1 star, tier-2 = 2 stars, tier-3 = 3 stars
  const starAward = result.isCorrect ? result.problem.tier : 0;

  return {
    ...state,
    currentStreak: newStreak,
    maxStreak: Math.max(state.maxStreak, newStreak),
    starsEarned: state.starsEarned + starAward,
    problemsAnswered: state.problemsAnswered + 1,
    currentProblemIndex: state.currentProblemIndex + 1,
    results: [...state.results, result],
  };
}

/**
 * Determine the session phase based on elapsed time.
 *
 * - 0–120s (0–2 min): warm-up
 * - 120–810s (2–13.5 min): core
 * - 810–900s (13.5–15 min): cool-down
 *
 * @param elapsedSeconds - Seconds elapsed since session start
 * @returns The current phase
 */
export function getPhaseForElapsed(elapsedSeconds: number): Phase {
  if (elapsedSeconds < 0) return PHASES.WARM_UP;
  if (elapsedSeconds < WARMUP_DURATION_SECONDS) return PHASES.WARM_UP;
  if (
    elapsedSeconds <
    WARMUP_DURATION_SECONDS + CORE_DURATION_SECONDS
  ) {
    return PHASES.CORE;
  }
  return PHASES.COOL_DOWN;
}

/**
 * Compute a session summary result from the current session state.
 *
 * @param state - Session state (must have results populated)
 * @returns Summary of the completed session
 */
export function computeSessionResult(state: SessionState): SessionResult {
  const results = state.results;
  const totalProblems = results.length;
  const correctCount = results.filter((r) => r.isCorrect).length;

  // Calculate accuracy (0–100)
  const accuracy = totalProblems > 0
    ? Math.round((correctCount / totalProblems) * 100)
    : 0;

  // Determine which phases were completed
  const phasesCompleted: Record<Phase, boolean> = {
    [PHASES.WARM_UP]: false,
    [PHASES.CORE]: false,
    [PHASES.COOL_DOWN]: false,
  };
  for (const r of results) {
    phasesCompleted[r.problem.phase] = true;
  }

  // Extract unique skills practiced
  const skillsPracticedSet = new Set<SkillId>();
  for (const r of results) {
    skillsPracticedSet.add(r.problem.skillId);
  }
  const skillsPracticed = Array.from(skillsPracticedSet);

  return {
    id: generateSessionId(),
    date: new Date().toISOString(),
    durationSeconds: state.elapsedSeconds,
    phasesCompleted,
    accuracy,
    totalStars: state.starsEarned,
    streakMax: state.maxStreak,
    skillsPracticed,
    problems: results,
    badgesEarned: [], // populated later by scoring.ts
  };
}

/**
 * Check if the session should be considered complete.
 *
 * A session is complete when:
 * - The timer has elapsed the full duration, OR
 * - All problems in the queue have been answered.
 *
 * @param state - Current session state
 * @returns true if the session is complete
 */
export function isSessionComplete(state: SessionState): boolean {
  // Timer expired
  if (state.elapsedSeconds >= SESSION_DURATION_SECONDS) return true;

  // All queued problems answered
  if (
    state.problemQueue.length > 0 &&
    state.currentProblemIndex >= state.problemQueue.length
  ) {
    return true;
  }

  return false;
}

/**
 * Check if the system should impose a hard stop.
 *
 * Hard stop condition: more than `HARD_STOP_CONSECUTIVE_ERRORS` consecutive
 * incorrect answers.
 *
 * @param state - Current session state
 * @returns true if hard stop is needed
 */
export function shouldHardStop(state: SessionState): boolean {
  if (state.results.length <= HARD_STOP_CONSECUTIVE_ERRORS) return false;

  const lastN = state.results.slice(-(HARD_STOP_CONSECUTIVE_ERRORS + 1));
  return lastN.every((r) => !r.isCorrect);
}

/**
 * Get the count of consecutive errors from the end of results.
 */
export function getConsecutiveErrors(results: ProblemResult[]): number {
  let count = 0;
  for (let i = results.length - 1; i >= 0; i--) {
    if (!results[i].isCorrect) {
      count++;
    } else {
      break;
    }
  }
  return count;
}

/**
 * Generate a simple unique session ID (no dependency on DOM crypto).
 */
function generateSessionId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 9);
  return `s-${timestamp}-${random}`;
}

/**
 * Get the count of consecutive correct answers from the end of results.
 */
export function getConsecutiveCorrect(results: ProblemResult[]): number {
  let count = 0;
  for (let i = results.length - 1; i >= 0; i--) {
    if (results[i].isCorrect) {
      count++;
    } else {
      break;
    }
  }
  return count;
}
