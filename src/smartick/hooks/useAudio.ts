/**
 * useAudio — React hook wrapping the sounds.ts module.
 *
 * Lazily initializes the Web Audio API (AudioContext) on the first playback
 * call, satisfying browser autoplay policies. Mute state is persisted to
 * the `smartick.settings` key in localStorage.
 *
 * @module hooks/useAudio
 */

import { useState, useCallback, useEffect } from "react";
import {
  playCorrect as soundsPlayCorrect,
  playIncorrect as soundsPlayIncorrect,
  playMilestone as soundsPlayMilestone,
  playStreak as soundsPlayStreak,
  playSessionEnd as soundsPlaySessionEnd,
  setMuted,
  getAudioContext,
} from "../audio/sounds";
import {
  speak as ttsSpeak,
  setTtsEnabled,
  setSpeechMuted,
} from "../audio/tts";
import {
  startMusic as musicStart,
  stopMusic as musicStop,
  setMusicEnabled,
  setMusicMuted,
} from "../audio/music";

export interface UseAudioReturn {
  /** Play the "correct answer" chime (C5→E5). */
  playCorrect: () => void;
  /** Play the "incorrect answer" tone (G3 triangle). */
  playIncorrect: () => void;
  /** Play the milestone arpeggio (C5→E5→G5). */
  playMilestone: () => void;
  /** Play the streak ascending sequence (C5→D5→E5→G5). */
  playStreak: () => void;
  /** Play the session-end fanfare (C5→E5→G5→C6). */
  playSessionEnd: () => void;
  /** Speak a phrase via TTS (delegates to tts.ts, rate 0.9). */
  speak: (text: string) => void;
  /** Start the background music loop (pentatonic). */
  startMusic: () => void;
  /** Stop the background music loop. */
  stopMusic: () => void;
  /** Whether audio output is currently muted. */
  isMuted: boolean;
  /** Toggle mute state on/off (persisted to localStorage). */
  toggleMute: () => void;
}

/**
 * Read the mute state from the persisted settings.
 * Falls back to `false` (unmuted) on first run or if the key is missing.
 */
function readMutedFromStorage(): boolean {
  try {
    const raw = localStorage.getItem("smartick.settings");
    if (raw) {
      const settings = JSON.parse(raw);
      return settings.audioEnabled === false;
    }
  } catch {
    // Ignore parse errors — default to unmuted
  }
  return false;
}

/**
 * Persist the mute state to the settings in localStorage.
 */
function writeMutedToStorage(muted: boolean): void {
  try {
    const raw = localStorage.getItem("smartick.settings");
    const settings = raw ? JSON.parse(raw) : {};
    settings.audioEnabled = !muted;
    localStorage.setItem("smartick.settings", JSON.stringify(settings));
  } catch {
    // Ignore write errors
  }
}

/**
 * Provides audio playback controls tied to the sounds.ts module.
 *
 * The AudioContext is lazy-initialized inside the sounds module on the
 * first call to any play* function, so no explicit init is needed here.
 * Mute state is synced with the sounds.ts internal flag on every change.
 */
export function useAudio(): UseAudioReturn {
  const [isMuted, setIsMuted] = useState<boolean>(() => readMutedFromStorage());

  // ── Initialize feature gates from localStorage on mount ──
  useEffect(() => {
    try {
      const raw = localStorage.getItem("smartick.settings");
      if (raw) {
        const settings = JSON.parse(raw);
        setTtsEnabled(settings.ttsEnabled !== false);
        setMusicEnabled(settings.musicEnabled !== false);
      }
    } catch {
      // Ignore parse errors — default to enabled
    }
  }, []);

  // Sync local mute state with sounds.ts, tts.ts, and music.ts modules
  useEffect(() => {
    setMuted(isMuted);
    setSpeechMuted(isMuted);
    setMusicMuted(isMuted);
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      writeMutedToStorage(next);
      setSpeechMuted(next);
      setMusicMuted(next);
      return next;
    });
  }, []);

  // ── TTS ────────────────────────────────────────────────────
  const speak = useCallback((text: string) => {
    ttsSpeak(text, 0.9);
  }, []);

  // ── Background music ───────────────────────────────────────
  const startMusic = useCallback(() => {
    const ctx = getAudioContext();
    if (!ctx) return;
    musicStart(ctx);
  }, []);

  const stopMusic = useCallback(() => {
    musicStop();
  }, []);

  // Play functions — these delegate directly to the sounds.ts module.
  // The module handles mute checks internally via ensureAudio().
  const playCorrect = useCallback(() => {
    soundsPlayCorrect();
  }, []);

  const playIncorrect = useCallback(() => {
    soundsPlayIncorrect();
  }, []);

  const playMilestone = useCallback(() => {
    soundsPlayMilestone();
  }, []);

  const playStreak = useCallback(() => {
    soundsPlayStreak();
  }, []);

  const playSessionEnd = useCallback(() => {
    soundsPlaySessionEnd();
  }, []);

  return {
    playCorrect,
    playIncorrect,
    playMilestone,
    playStreak,
    playSessionEnd,
    speak,
    startMusic,
    stopMusic,
    isMuted,
    toggleMute,
  };
}
