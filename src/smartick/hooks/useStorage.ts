/**
 * useStorage — React hook wrapping the persistence service.
 *
 * Loads all persisted data from localStorage on mount and exposes it
 * as reactive state. Every mutation function writes through to localStorage
 * immediately and returns synchronously so callers can use the updated
 * data in the same render cycle.
 *
 * @module hooks/useStorage
 */

import { useState, useEffect, useCallback } from "react";
import type {
  SkillId,
  SubSkillId,
  SkillMap,
  Settings,
  Badge,
  SessionResult,
  SessionState,
  SubSkillAttempt,
} from "../engine/types";
import {
  getSkillState,
  updateSkillState as storageUpdateSkill,
  getSessions,
  saveSession as storageSaveSession,
  getSettings,
  updateSettings as storageUpdateSettings,
  getBadges,
  awardBadge as storageAwardBadge,
  getSessionState,
  saveSessionState as storageSaveSessionState,
  clearSessionState as storageClearSessionState,
} from "../data/storage";
import { defaultSkillMap, defaultSettings } from "../data/defaults";

export interface UseStorageReturn {
  /** The full skill map with all 8 skills and their sub-skill states. */
  skillState: SkillMap;
  /**
   * Update a sub-skill's stats after a problem attempt.
   * Persists immediately and returns the updated map.
   */
  updateSkill: (
    skillId: SkillId,
    subSkillId: SubSkillId,
    result: SubSkillAttempt,
  ) => SkillMap;

  /** The session history array (capped at 30). */
  sessions: SessionResult[];
  /** Append a completed session result to the history. */
  saveSession: (result: SessionResult) => void;

  /** The current user settings. */
  settings: Settings;
  /** Merge partial settings and persist. */
  updateSettings: (partial: Partial<Settings>) => void;

  /** The array of earned badges. */
  badges: Badge[];
  /** Award a new badge (skips duplicates by ID). */
  awardBadge: (badge: Badge) => void;

  /** The in-progress session state, or null if none / stale. */
  sessionState: SessionState | null;
  /** Persist the in-progress session state. */
  saveSessionState: (state: SessionState) => void;
  /** Remove the in-progress session state (call on normal completion). */
  clearSessionState: () => void;

  /** Whether all data has been loaded from localStorage on mount. */
  isLoaded: boolean;
}

/**
 * Load all persisted data on mount and expose it as reactive state.
 *
 * All mutation functions write through to localStorage immediately and
 * also update React state so that the UI stays consistent.
 */
export function useStorage(): UseStorageReturn {
  // ── State ─────────────────────────────────────

  const [skillState, setSkillState] = useState<SkillMap>(defaultSkillMap());
  const [sessions, setSessions] = useState<SessionResult[]>([]);
  const [settings, setSettings] = useState<Settings>(defaultSettings());
  const [badges, setBadges] = useState<Badge[]>([]);
  const [sessionState, setSessionState] = useState<SessionState | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // ── Load on mount ─────────────────────────────

  useEffect(() => {
    setSkillState(getSkillState());
    setSessions(getSessions());
    setSettings(getSettings());
    setBadges(getBadges());
    setSessionState(getSessionState());
    setIsLoaded(true);
  }, []);

  // ── Mutations (write-through) ─────────────────

  const updateSkill = useCallback(
    (
      skillId: SkillId,
      subSkillId: SubSkillId,
      result: SubSkillAttempt,
    ): SkillMap => {
      const updated = storageUpdateSkill(skillId, subSkillId, result);
      setSkillState(updated);
      return updated;
    },
    [],
  );

  const saveSession = useCallback((result: SessionResult) => {
    storageSaveSession(result);
    setSessions(getSessions());
    setSettings(getSettings());
  }, []);

  const updateSettings = useCallback((partial: Partial<Settings>) => {
    storageUpdateSettings(partial);
    setSettings(getSettings());
  }, []);

  const awardBadge = useCallback((badge: Badge) => {
    storageAwardBadge(badge);
    setBadges(getBadges());
  }, []);

  const saveSessionState = useCallback((state: SessionState) => {
    storageSaveSessionState(state);
    setSessionState(state);
  }, []);

  const clearSessionState = useCallback(() => {
    storageClearSessionState();
    setSessionState(null);
  }, []);

  return {
    skillState,
    updateSkill,
    sessions,
    saveSession,
    settings,
    updateSettings,
    badges,
    awardBadge,
    sessionState,
    saveSessionState,
    clearSessionState,
    isLoaded,
  };
}
