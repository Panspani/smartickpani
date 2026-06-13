/**
 * localStorage persistence service for Smartick Math Sessions.
 *
 * All keys are prefixed with `smartick.` for full namespace isolation.
 * Every read is wrapped in try/catch — corrupted JSON silently returns
 * the default value instead of crashing.
 *
 * @module data/storage
 */

import type {
  SkillId,
  SubSkillId,
  SkillMap,
  SubSkillState,
  Settings,
  Badge,
  SessionResult,
  SessionState,
  SubSkillAttempt,
} from "../engine/types";
import { defaultSkillMap, defaultSettings } from "./defaults";

// ──────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────

const PREFIX = "smartick.";

const KEYS = {
  SKILLS: `${PREFIX}skills`,
  SESSIONS: `${PREFIX}sessions`,
  SETTINGS: `${PREFIX}settings`,
  BADGES: `${PREFIX}badges`,
  SESSION_STATE: `${PREFIX}sessionState`,
} as const;

/** Maximum number of saved sessions (FIFO eviction). */
const MAX_SESSIONS = 30;

/** Staleness threshold in milliseconds (60 minutes). */
const STALE_THRESHOLD_MS = 60 * 60 * 1000;

/** Maximum entries in the lastAttempts rolling window. */
const MAX_LAST_ATTEMPTS = 10;

// ──────────────────────────────────────────────
// Internal helpers
// ──────────────────────────────────────────────

/**
 * Safe JSON parse. Returns `fallback` if the value is null, undefined,
 * or fails to parse.
 */
function safeParse<T>(raw: string | null, fallback: T): T {
  if (raw === null) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    console.warn(
      `[smartick/storage] Corrupted data detected, returning default.`,
    );
    return fallback;
  }
}

/**
 * Deep-clone a SkillMap so mutations don't leak between the cache and
 * the stored copy.
 */
function cloneSkillMap(map: SkillMap): SkillMap {
  return JSON.parse(JSON.stringify(map)) as SkillMap;
}

// ──────────────────────────────────────────────
// Skill State — smartick.skills
// ──────────────────────────────────────────────

/**
 * Read the full skill map from localStorage.
 * Returns the default SkillMap on missing or corrupted data.
 */
export function getSkillState(): SkillMap {
  const raw = localStorage.getItem(KEYS.SKILLS);
  return safeParse(raw, defaultSkillMap());
}

/**
 * Atomically update a single sub-skill's stats after a problem attempt.
 *
 * - Increments `attempts` and `correctCount` (if correct).
 * - Accumulates `totalResponseTimeMs`.
 * - Appends the boolean result to `lastAttempts` (FIFO, capped at 10).
 * - Recomputes `accuracy` and `mastered` for the sub-skill.
 * - Recomputes `masteryPercentage` and `skillMastered` for the parent skill.
 *
 * @param skillId   - The skill to update
 * @param subSkillId - The sub-skill to update
 * @param result    - The attempt result (isCorrect + responseTimeMs)
 */
export function updateSkillState(
  skillId: SkillId,
  subSkillId: SubSkillId,
  result: SubSkillAttempt,
): SkillMap {
  const map = cloneSkillMap(getSkillState());
  const skill = map[skillId];
  if (!skill) return map;

  const subSkill = skill.subSkills.find(
    (s: SubSkillState) => s.id === subSkillId,
  );
  if (!subSkill) return map;

  // --- Update sub-skill ---
  subSkill.attempts += 1;
  if (result.isCorrect) {
    subSkill.correctCount += 1;
  }
  subSkill.totalResponseTimeMs += result.responseTimeMs;
  subSkill.lastAttempts = [
    ...subSkill.lastAttempts,
    result.isCorrect,
  ].slice(-MAX_LAST_ATTEMPTS);

  // Recompute accuracy (overall, 0–100)
  subSkill.accuracy =
    subSkill.attempts > 0
      ? Math.round((subSkill.correctCount / subSkill.attempts) * 100)
      : 0;

  // Recompute mastered: ≥80% accuracy on last 10 AND avg response ≤30s
  const recentCorrect = subSkill.lastAttempts.filter(Boolean).length;
  const recentAccuracy =
    subSkill.lastAttempts.length > 0
      ? (recentCorrect / subSkill.lastAttempts.length) * 100
      : 0;
  const avgResponseTime =
    subSkill.attempts > 0
      ? subSkill.totalResponseTimeMs / subSkill.attempts
      : Infinity;
  subSkill.mastered =
    recentAccuracy >= 80 && avgResponseTime <= 30_000;

  // --- Recompute skill-level mastery ---
  const subCount = skill.subSkills.length;
  const totalAccuracy = skill.subSkills.reduce(
    (sum: number, s: SubSkillState) => sum + s.accuracy,
    0,
  );
  skill.masteryPercentage =
    subCount > 0 ? Math.round(totalAccuracy / subCount) : 0;

  const masteredCount = skill.subSkills.filter(
    (s: SubSkillState) => s.mastered,
  ).length;
  skill.skillMastered = masteredCount >= Math.ceil(subCount * 0.7);

  skill.lastPracticed = new Date().toISOString();

  // --- Persist ---
  localStorage.setItem(KEYS.SKILLS, JSON.stringify(map));
  return map;
}

// ──────────────────────────────────────────────
// Session History — smartick.sessions
// ──────────────────────────────────────────────

/**
 * Read the session history array from localStorage.
 * Returns an empty array on missing or corrupted data.
 */
export function getSessions(): SessionResult[] {
  const raw = localStorage.getItem(KEYS.SESSIONS);
  return safeParse(raw, []);
}

/**
 * Append a session result to the history and persist.
 *
 * Enforces a 30-session cap: if there are already 30 entries,
 * the oldest (earliest date) is evicted before appending.
 *
 * @param result - The completed session result
 */
export function saveSession(result: SessionResult): void {
  const sessions = getSessions();
  sessions.push(result);

  // Cap at MAX_SESSIONS — remove oldest entries
  if (sessions.length > MAX_SESSIONS) {
    sessions.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
    sessions.splice(0, sessions.length - MAX_SESSIONS);
  }

  localStorage.setItem(KEYS.SESSIONS, JSON.stringify(sessions));
}

// ──────────────────────────────────────────────
// Settings — smartick.settings
// ──────────────────────────────────────────────

/**
 * Read the settings object from localStorage.
 * Returns defaults on missing or corrupted data.
 */
export function getSettings(): Settings {
  const raw = localStorage.getItem(KEYS.SETTINGS);
  return safeParse(raw, defaultSettings());
}

/**
 * Merge partial settings into the current settings and persist.
 *
 * @param partial - A partial Settings object with only the fields to update
 */
export function updateSettings(partial: Partial<Settings>): void {
  const current = getSettings();
  const merged: Settings = { ...current, ...partial };
  localStorage.setItem(KEYS.SETTINGS, JSON.stringify(merged));
}

// ──────────────────────────────────────────────
// Badges — smartick.badges
// ──────────────────────────────────────────────

/**
 * Read the badge array from localStorage.
 * Returns an empty array on missing or corrupted data.
 */
export function getBadges(): Badge[] {
  const raw = localStorage.getItem(KEYS.BADGES);
  return safeParse(raw, []);
}

/**
 * Award a badge to the user. Silently skips if a badge with the same
 * ID already exists (prevents duplicates).
 *
 * @param badge - The badge to award
 */
export function awardBadge(badge: Badge): void {
  const badges = getBadges();

  // Deduplicate by ID
  if (badges.some((b: Badge) => b.id === badge.id)) return;

  badges.push(badge);
  localStorage.setItem(KEYS.BADGES, JSON.stringify(badges));
}

// ──────────────────────────────────────────────
// Session State (In-Progress) — smartick.sessionState
// ──────────────────────────────────────────────

/**
 * Read the in-progress session state from localStorage.
 *
 * Performs a staleness check: if the session's `startTime` is more than
 * 60 minutes in the past, the session is considered stale and `null` is
 * returned (the stale data is NOT automatically deleted — the caller
 * should call `clearSessionState` if they choose to discard it).
 *
 * @returns The saved session state, or null if missing / corrupted / stale
 */
export function getSessionState(): SessionState | null {
  const raw = localStorage.getItem(KEYS.SESSION_STATE);
  const state = safeParse<SessionState | null>(raw, null);
  if (!state) return null;

  // Staleness check: > 60 minutes since startTime
  const startTime = new Date(state.startTime).getTime();
  if (isNaN(startTime)) return null;

  const age = Date.now() - startTime;
  if (age > STALE_THRESHOLD_MS) {
    // Stale — discard and return null
    clearSessionState();
    return null;
  }

  return state;
}

/**
 * Save the current in-progress session state.
 * Overwrites any previously saved state.
 *
 * @param state - The session state to persist
 */
export function saveSessionState(state: SessionState): void {
  localStorage.setItem(KEYS.SESSION_STATE, JSON.stringify(state));
}

/**
 * Remove the in-progress session state from localStorage entirely.
 * Called when a session completes normally.
 */
export function clearSessionState(): void {
  localStorage.removeItem(KEYS.SESSION_STATE);
}
