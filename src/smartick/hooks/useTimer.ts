/**
 * useTimer — Countdown timer hook (1 Hz).
 *
 * Provides elapsed/remaining time in seconds, a formatted "MM:SS" display
 * string, and controls to start (optionally from a given elapsed offset),
 * pause, and reset the timer.
 *
 * @module hooks/useTimer
 */

import { useState, useRef, useEffect, useMemo, useCallback } from "react";

export interface UseTimerReturn {
  /** Seconds elapsed since the timer started. */
  elapsed: number;
  /** Seconds remaining (duration − elapsed, clamped to 0). */
  remaining: number;
  /** Formatted display string in "MM:SS" format. */
  display: string;
  /** Whether the timer is currently counting. */
  isRunning: boolean;
  /** Whether the timer has reached zero (remaining ≤ 0). */
  isExpired: boolean;
  /** Whether the remaining time is below 60 seconds (low-time warning). */
  isLow: boolean;
  /**
   * Start (or resume) the timer.
   * Optionally accept an `initialElapsed` offset for session resume.
   */
  start: (initialElapsed?: number) => void;
  /** Pause the timer without resetting elapsed. */
  pause: () => void;
  /** Stop and reset elapsed back to 0. */
  reset: () => void;
}

/**
 * Countdown timer with 1-second resolution.
 *
 * @param durationSeconds - Total countdown duration in seconds (default 900 = 15 min)
 * @returns Timer state and controls
 */
export function useTimer(durationSeconds: number = 900): UseTimerReturn {
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasStarted = useRef(false);

  // Derived values
  const remaining = Math.max(0, durationSeconds - elapsed);
  const isExpired = remaining <= 0 && hasStarted.current;
  const isLow = remaining > 0 && remaining < 60;

  const display = useMemo(() => {
    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }, [remaining]);

  // ── Controls ─────────────────────────────────

  const start = useCallback(
    (initialElapsed: number = 0) => {
      if (intervalRef.current !== null) return; // Already running
      setElapsed(initialElapsed);
      setIsRunning(true);
      hasStarted.current = true;

      intervalRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    },
    [],
  );

  const pause = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setElapsed(0);
    setIsRunning(false);
    hasStarted.current = false;
  }, []);

  // ── Auto-stop on expiry ──────────────────────

  useEffect(() => {
    if (elapsed >= durationSeconds && intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setIsRunning(false);
    }
  }, [elapsed, durationSeconds]);

  // ── Cleanup on unmount ───────────────────────

  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  return {
    elapsed,
    remaining,
    display,
    isRunning,
    isExpired,
    isLow,
    start,
    pause,
    reset,
  };
}
