/**
 * useSession — Core session orchestrator hook.
 *
 * Connects the adaptive engine, timer, audio, and persistence layers into
 * a single consumable interface. Manages the full session lifecycle:
 *
 *   start → active (problem → answer → next problem → …) → complete → results
 *
 * @module hooks/useSession
 */

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import type {
  Problem,
  ProblemResult,
  Phase,
  SessionState,
  SessionResult,
  SkillId,
  SubSkillId,
  SkillMap,
  SkillMasteryState,
  SubSkillMastery,
  MasteryLevel,
  GeneratorContext,
} from "../engine/types";
import { SKILL_IDS } from "../engine/types";
import { SESSION_DURATION_SECONDS } from "../engine/session";
import {
  createInitialSession,
  applyResult,
  getPhaseForElapsed,
  isSessionComplete as checkSessionComplete,
  computeSessionResult,
} from "../engine/session";
import { selectNextProblem } from "../engine/adaptive";
import { generateProblem } from "../engine/problems/templates";
import { computeStars, getStreakBonus, checkNewBadges, selectMessage } from "../engine/scoring";
import { useTimer } from "./useTimer";
import { useAudio } from "./useAudio";
import { useStorage } from "./useStorage";

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

/**
 * Convert a SkillMap (from persistence) into a SkillMasteryState
 * (consumed by the adaptive engine).
 */
function computeMasteryFromSkillMap(skillMap: SkillMap): SkillMasteryState {
  const skillPercentages = {} as Record<SkillId, number>;
  const subSkills = {} as Record<SubSkillId, SubSkillMastery>;

  for (const skill of Object.values(skillMap)) {
    skillPercentages[skill.id] = skill.masteryPercentage;
    for (const sub of skill.subSkills) {
      subSkills[sub.id] = {
        accuracy: sub.accuracy,
        attempts: sub.attempts,
        correctCount: sub.correctCount,
        totalResponseTimeMs: sub.totalResponseTimeMs,
        lastAttempts: sub.lastAttempts,
        masteryLevel: sub.mastered ? ("mastered" as MasteryLevel) : ("not-mastered" as MasteryLevel),
      };
    }
  }

  return { skillPercentages, subSkills };
}

/**
 * Compute average response time across all stored sessions plus the current
 * session result (used for badge eligibility).
 */
function computeAverageResponseTime(
  sessions: SessionResult[],
  currentResult: SessionResult,
): number {
  const allProblems = [
    ...sessions.flatMap((s) => s.problems),
    ...currentResult.problems,
  ];
  const withTime = allProblems.filter((p) => p.responseTimeMs !== null);
  if (withTime.length === 0) return 0;
  return withTime.reduce((sum, p) => sum + p.responseTimeMs!, 0) / withTime.length;
}

// ──────────────────────────────────────────────
// Return interface
// ──────────────────────────────────────────────

export interface UseSessionReturn {
  /** The current problem to display, or null if the session hasn't started. */
  currentProblem: Problem | null;
  /** The current session phase. */
  phase: Phase;
  /** Seconds elapsed in the session. */
  elapsed: number;
  /** Seconds remaining in the session. */
  remaining: number;
  /** Formatted timer display string ("MM:SS"). */
  timerDisplay: string;
  /** Total stars earned in the current session. */
  stars: number;
  /** Current correct streak. */
  streak: number;
  /** Total correct answers in the current session. */
  totalCorrect: number;
  /** Total attempt submissions in the current session. */
  totalAttempts: number;

  /** Submit an answer for the current problem. */
  submitAnswer: (answer: number) => { correct: boolean; message: string };
  /** Start a new session. */
  startSession: () => void;
  /** End the current session immediately. */
  endSession: () => void;

  /** Whether a session is currently active. */
  isSessionActive: boolean;
  /** Whether the current session has completed. */
  isSessionComplete: boolean;

  /** The final session result (populated after the session ends). */
  sessionResult: SessionResult | null;
  /** The current feedback message to display to the user. */
  feedbackMessage: string | null;
  /** The type of the current feedback (for styling / sound routing). */
  feedbackType: "correct" | "incorrect" | "streak" | "milestone" | null;
  /** Whether audio is currently muted. */
  isMuted: boolean;
  /** Toggle mute state on/off. */
  toggleMute: () => void;

  // ── Interleaved mini-game support ────────────

  /** Pause the session timer (for interleaved mini-game). */
  pauseTimer: () => void;
  /** Resume the session timer after pause. */
  resumeTimer: () => void;
  /** The current problem's sub-skill ID (for mini-game routing). */
  currentSubSkillId: SubSkillId | null;
  /** Last N correct problems for contextual mini-games. */
  recentProblems: Problem[];
}

// ──────────────────────────────────────────────
// Hook
// ──────────────────────────────────────────────

export function useSession(): UseSessionReturn {
  // ── Sub-hooks ────────────────────────────────

  const timer = useTimer(SESSION_DURATION_SECONDS);
  const audio = useAudio();
  const storage = useStorage();

  // ── Display state ────────────────────────────
  // These values change frequently and drive the UI.

  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  const [phase, setPhase] = useState<Phase>("warmup");
  const [stars, setStars] = useState(0);
  const [streak, setStreak] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<"correct" | "incorrect" | "streak" | "milestone" | null>(null);
  const [sessionResult, setSessionResult] = useState<SessionResult | null>(null);

  // ── Mutable refs (engine state, timestamps) ──

  const engineRef = useRef<SessionState | null>(null);
  const problemStartRef = useRef<number>(0);
  const recentMessagesRef = useRef<string[]>([]);
  const seedRef = useRef<number>(0);
  const isActiveRef = useRef(false);
  const finalizeRef = useRef<(() => void) | null>(null);

  // Tracks whether we've already spoken an incorrect message via TTS
  // in the current session, to avoid repeating on every wrong answer.
  const incorrectTtsSpokenRef = useRef(false);

  // Last 5 problems (all attempts, for mini-game context)
  const recentProblemsRef = useRef<Problem[]>([]);

  // ── Computed values ───────────────────────────

  const mastery = useMemo<SkillMasteryState>(
    () => computeMasteryFromSkillMap(storage.skillState),
    [storage.skillState],
  );

  const isSessionActive = isActiveRef.current && timer.isRunning && !timer.isExpired;

  const isSessionComplete =
    timer.isExpired ||
    (engineRef.current !== null && checkSessionComplete(engineRef.current));

  // ── Select + generate the next problem ─────────

  const selectAndGenerateProblem = useCallback(
    (
      session: SessionState,
      skillMap: SkillMap,
      masteryState: SkillMasteryState,
      problemIndex: number,
    ): Problem => {
      const selected = selectNextProblem(session, skillMap, masteryState);

      const context: GeneratorContext = {
        seed: seedRef.current,
        tier: selected.tier,
        phase: selected.phase,
        skillId: selected.skillId,
        subSkillId: selected.subSkillId,
        sessionProblemIndex: problemIndex,
      };

      const generated = generateProblem(context);

      return {
        ...selected,
        text: generated.text,
        answer: generated.answer,
        type: generated.type,
        options: generated.options,
        visualData: generated.visualData,
        sceneData: generated.sceneData,
      };
    },
    [],
  );

  // ── Finalize and end session ──────────────────

  const finalizeAndEndSession = useCallback(() => {
    if (!engineRef.current || !isActiveRef.current) return;

    // Stop background music before transitioning to results
    audio.stopMusic();

    isActiveRef.current = false;
    timer.pause();

    const engine = engineRef.current;

    // Compute result
    const result = computeSessionResult(engine);

    // Count mastered skills
    const skillsMastered = Object.values(storage.skillState).filter(
      (s) => s.skillMastered,
    ).length;

    // Check new badges
    const allSessions = storage.sessions;
    const avgResponse = computeAverageResponseTime(allSessions, result);
    const newBadgesList = checkNewBadges(
      allSessions.length + 1,
      skillsMastered,
      avgResponse,
    );
    const earnedIds = new Set(storage.badges.map((b) => b.id));
    const toAward = newBadgesList.filter((b) => !earnedIds.has(b.id));

    for (const badge of toAward) {
      storage.awardBadge(badge);
    }
    result.badgesEarned = toAward;

    // Update settings (streak tracking)
    const today = new Date().toISOString().split("T")[0];
    const currentSettings = storage.settings;
    let newStreakDays = currentSettings.streakDays;

    if (currentSettings.lastActivityDate) {
      const yesterday = new Date(Date.now() - 86_400_000)
        .toISOString()
        .split("T")[0];
      if (currentSettings.lastActivityDate === yesterday) {
        newStreakDays += 1;
      } else if (currentSettings.lastActivityDate !== today) {
        newStreakDays = 1;
      }
    } else {
      newStreakDays = 1;
    }

    storage.updateSettings({
      lastSessionDate: today,
      lastActivityDate: today,
      streakDays: newStreakDays,
    });

    // Persist session and clear active state
    storage.saveSession(result);
    storage.clearSessionState();

    // Update UI
    setSessionResult(result);
    setCurrentProblem(null);
    setStars(result.totalStars);

    // Session-end message
    const endMsg = selectMessage("session-end");
    setFeedbackMessage(endMsg);
    setFeedbackType("milestone");
    recentMessagesRef.current = [...recentMessagesRef.current, endMsg].slice(-5);

    // Play sounds
    if (toAward.length > 0) {
      audio.playMilestone();
    }
    audio.playSessionEnd();
  }, [timer, audio, storage]);

  // Keep finalizeRef up to date
  finalizeRef.current = finalizeAndEndSession;

  // ── Fix StrictMode double-mount ─────────────────
  // React StrictMode in dev mounts → unmounts → remounts.
  // We MUST reset isActiveRef on unmount so the remount
  // can start a fresh session. Without this, isActiveRef
  // stays true and startSession() returns early — the
  // timer never starts.
  useEffect(() => {
    return () => {
      isActiveRef.current = false;
    };
  }, []);

  // ── Update phase on timer tick ────────────────

  useEffect(() => {
    if (!engineRef.current || !isActiveRef.current) return;

    const newPhase = getPhaseForElapsed(timer.elapsed);

    engineRef.current = {
      ...engineRef.current,
      phase: newPhase,
      elapsedSeconds: timer.elapsed,
    };

    if (newPhase !== phase) {
      setPhase(newPhase);
    }

    // Periodic save (every 5 seconds)
    if (timer.elapsed % 5 === 0 || newPhase !== phase) {
      storage.saveSessionState(engineRef.current);
    }
  }, [timer.elapsed, phase, storage]);

  // ── Auto-end when timer expires ───────────────

  useEffect(() => {
    if (timer.isExpired && isActiveRef.current) {
      // Mark current problem as unanswered if one is pending
      if (currentProblem) {
        const timeoutResult: ProblemResult = {
          problem: currentProblem,
          isCorrect: false,
          responseTimeMs: null,
        };
        engineRef.current = applyResult(engineRef.current!, timeoutResult);
        setCurrentProblem(null);
        setTotalAttempts((p) => p + 1);
      }
      finalizeRef.current?.();
    }
    // Only fire on isExpired becoming true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer.isExpired]);

  // ── Resume stale session on mount ────────────

  useEffect(() => {
    if (!storage.isLoaded || !storage.sessionState || isActiveRef.current) return;

    const saved = storage.sessionState;
    engineRef.current = saved;
    isActiveRef.current = true;
    seedRef.current = Math.floor(Math.random() * 100_000);

    setPhase(saved.phase);
    setStreak(saved.currentStreak);
    setStars(saved.starsEarned);
    setTotalCorrect(saved.results.filter((r) => r.isCorrect).length);
    setTotalAttempts(saved.results.length);

    // Generate next problem
    const nextProblem = selectAndGenerateProblem(
      saved,
      storage.skillState,
      mastery,
      saved.problemsAnswered,
    );
    setCurrentProblem(nextProblem);
    problemStartRef.current = Date.now();

    // Resume timer from saved elapsed
    timer.start(saved.elapsedSeconds);
  }, [storage.isLoaded, storage.sessionState, storage.skillState, mastery, selectAndGenerateProblem, timer]);

  // ── startSession ──────────────────────────────

  const startSession = useCallback(() => {
    if (isActiveRef.current) return;

    // Clear any stale session state
    storage.clearSessionState();

    const initial = createInitialSession(storage.skillState);
    engineRef.current = initial;
    isActiveRef.current = true;
    seedRef.current = Math.floor(Math.random() * 100_000);

    setPhase(initial.phase);
    setStreak(0);
    setStars(0);
    setTotalCorrect(0);
    setTotalAttempts(0);
    setFeedbackMessage(null);
    setFeedbackType(null);
    setSessionResult(null);
    recentMessagesRef.current = [];
    incorrectTtsSpokenRef.current = false;

    // Generate first problem
    const firstProblem = selectAndGenerateProblem(
      initial,
      storage.skillState,
      mastery,
      0,
    );
    setCurrentProblem(firstProblem);
    problemStartRef.current = Date.now();

    // Start background music
    audio.startMusic();

    // Persist and start timer
    storage.saveSessionState(initial);
    timer.start();
  }, [storage.skillState, mastery, selectAndGenerateProblem, storage, timer, audio]);

  // ── submitAnswer ──────────────────────────────

  const submitAnswer = useCallback(
    (answer: number): { correct: boolean; message: string } => {
      if (!currentProblem || !engineRef.current || !isActiveRef.current) {
        return { correct: false, message: "La sesión no está activa" };
      }

      const isCorrect = answer === currentProblem.answer;
      const responseTimeMs = Date.now() - problemStartRef.current;

      // Preserve the old streak for broken-streak detection
      const oldStreak = engineRef.current.currentStreak;

      // Build problem result
      const problemResult: ProblemResult = {
        problem: currentProblem,
        isCorrect,
        responseTimeMs,
      };

      // Apply to engine state
      const newEngine = applyResult(engineRef.current, problemResult);
      engineRef.current = newEngine;

      // Persist sub-skill update (returns the freshly written SkillMap)
      const updatedSkillMap = storage.updateSkill(
        currentProblem.skillId,
        currentProblem.subSkillId,
        { isCorrect, responseTimeMs },
      );

      // Update display stats
      setStreak(newEngine.currentStreak);
      setStars(newEngine.starsEarned);
      setTotalCorrect((p) => p + (isCorrect ? 1 : 0));
      setTotalAttempts((p) => p + 1);

      // Track recent problems for contextual mini-games
      recentProblemsRef.current = [
        ...recentProblemsRef.current,
        currentProblem,
      ].slice(-5);

      // Play sound
      if (!isCorrect) {
        audio.playIncorrect();
      } else if ([5, 10, 15].includes(newEngine.currentStreak)) {
        audio.playMilestone();
      } else {
        audio.playCorrect();
      }

      // Select message
      let msg: string;
      let fbType: "correct" | "incorrect" | "streak" | "milestone";

      if (isCorrect) {
        if ([5, 10, 15].includes(newEngine.currentStreak)) {
          msg = selectMessage("streak", {
            recentMessages: recentMessagesRef.current,
            streakLength: newEngine.currentStreak,
          });
          fbType = "streak";
        } else {
          msg = selectMessage("correct", {
            recentMessages: recentMessagesRef.current,
          });
          fbType = "correct";
        }
      } else if (oldStreak >= 2) {
        // Streak broken
        msg = selectMessage("streak", {
          isStreakBroken: true,
          streakLength: oldStreak,
        });
        fbType = "incorrect";
      } else {
        msg = selectMessage("incorrect", {
          recentMessages: recentMessagesRef.current,
        });
        fbType = "incorrect";
      }

      setFeedbackMessage(msg);
      setFeedbackType(fbType);
      recentMessagesRef.current = [...recentMessagesRef.current, msg].slice(-5);

      // Speak feedback via TTS
      // Reuses the already-selected `msg` — TTS says what's shown on screen.
      // Incorrect messages are spoken only once per session to avoid annoyance.
      if (isCorrect) {
        audio.speak(msg);
      } else if (!incorrectTtsSpokenRef.current) {
        audio.speak(msg);
        incorrectTtsSpokenRef.current = true;
      }

      // Update phase from elapsed
      const currentPhase = getPhaseForElapsed(timer.elapsed);
      if (currentPhase !== phase) {
        setPhase(currentPhase);
        newEngine.phase = currentPhase;
      }

      // Check if session is complete
      if (checkSessionComplete(newEngine)) {
        setCurrentProblem(null);
        finalizeRef.current?.();
        return { correct: isCorrect, message: msg };
      }

      // Get next problem using the freshly-updated skill map
      const updatedMastery = computeMasteryFromSkillMap(updatedSkillMap);
      const nextProblem = selectAndGenerateProblem(
        newEngine,
        updatedSkillMap,
        updatedMastery,
        newEngine.problemsAnswered,
      );
      setCurrentProblem(nextProblem);
      problemStartRef.current = Date.now();

      // Save session state
      storage.saveSessionState(newEngine);

      return { correct: isCorrect, message: msg };
    },
    [
      currentProblem,
      phase,
      timer.elapsed,
      storage,
      audio,
      selectAndGenerateProblem,
    ],
  );

  // ── endSession ────────────────────────────────

  const endSession = useCallback(() => {
    if (!isActiveRef.current) return;

    // Mark current problem as unanswered if one is pending
    if (currentProblem) {
      const timeoutResult: ProblemResult = {
        problem: currentProblem,
        isCorrect: false,
        responseTimeMs: null,
      };
      engineRef.current = applyResult(engineRef.current!, timeoutResult);
      setCurrentProblem(null);
      setTotalAttempts((p) => p + 1);
    }

    finalizeRef.current?.();
  }, [currentProblem]);

  // ── Timer controls for interleaved mini-games ─

  const pauseTimer = useCallback(() => {
    timer.pause();
  }, [timer]);

  const resumeTimer = useCallback(() => {
    if (isActiveRef.current && !timer.isExpired) {
      timer.start(timer.elapsed);
    }
  }, [timer]);

  // ── Derived values ───────────────────────────

  const currentSubSkillId = currentProblem?.subSkillId ?? null;
  const recentProblems = recentProblemsRef.current;

  // ── Return ────────────────────────────────────

  return {
    currentProblem,
    phase,
    elapsed: timer.elapsed,
    remaining: timer.remaining,
    timerDisplay: timer.display,
    stars,
    streak,
    totalCorrect,
    totalAttempts,
    submitAnswer,
    startSession,
    endSession,
    pauseTimer,
    resumeTimer,
    currentSubSkillId,
    recentProblems,
    isSessionActive,
    isSessionComplete,
    sessionResult,
    feedbackMessage,
    feedbackType,
    isMuted: audio.isMuted,
    toggleMute: audio.toggleMute,
  };
}
