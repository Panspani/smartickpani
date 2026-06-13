/**
 * Default values for all persisted data stores.
 *
 * These are used by the storage service when a localStorage key is missing
 * or corrupted, ensuring the app always has valid initial state.
 *
 * @module data/defaults
 */

import type { SkillMap, Settings, Badge, SessionResult } from "../engine/types";
import { DEFAULT_SETTINGS } from "../engine/types";
import { buildInitialSkillMap } from "../engine/skill-map";

/**
 * Returns a fresh SkillMap with all 8 skills and 27 sub-skills
 * initialized to zero mastery. All skills start unlocked.
 *
 * Delegates to `buildInitialSkillMap()` from the engine layer.
 */
export function defaultSkillMap(): SkillMap {
  return buildInitialSkillMap();
}

/**
 * Returns the default settings.
 *
 * - audioEnabled: true
 * - language: "es-AR"
 * - lastSessionDate: null
 * - streakDays: 0
 * - lastActivityDate: null
 */
export function defaultSettings(): Settings {
  return { ...DEFAULT_SETTINGS };
}

/**
 * Returns an empty badges array.
 */
export function defaultBadges(): Badge[] {
  return [];
}

/**
 * Returns an empty sessions array.
 */
export function defaultSessions(): SessionResult[] {
  return [];
}
