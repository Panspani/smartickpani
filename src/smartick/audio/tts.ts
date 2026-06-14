/**
 * TTS (Text-to-Speech) service using the browser SpeechSynthesis API.
 *
 * Module-level singleton following the same pattern as sounds.ts.
 * Provides Spanish (es-AR) speech at a slower rate for children.
 * Gracefully degrades when SpeechSynthesis is unavailable (e.g., Safari iOS).
 *
 * @module audio/tts
 */

// ──────────────────────────────────────────────
// State
// ──────────────────────────────────────────────

let _ttsEnabled = true;
let _speechMuted = false;

// ──────────────────────────────────────────────
// Public API
// ──────────────────────────────────────────────

/**
 * Speak a phrase using the browser SpeechSynthesis API.
 *
 * @param text - The text to speak (Spanish phrases expected).
 * @param rate - Speech rate; 0.9 is slightly slower for children (default).
 * @param onEnd - Optional callback fired when speech finishes (or is cancelled).
 *
 * Respects both `ttsEnabled` gate and `speechMuted` master mute.
 * Silently no-ops if `window.speechSynthesis` is unavailable (graceful degradation).
 */
export function speak(text: string, rate = 0.9, onEnd?: () => void): void {
  if (!_ttsEnabled || _speechMuted) {
    onEnd?.();
    return;
  }
  if (typeof window === "undefined" || !window.speechSynthesis) {
    onEnd?.();
    return;
  }

  // Cancel any utterance in progress before starting a new one
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "es-AR";
  utterance.rate = rate;
  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }
  window.speechSynthesis.speak(utterance);
}

/**
 * Immediately cancel any in-progress speech.
 */
export function cancel(): void {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Enable or disable TTS globally (feature gate).
 * When disabled, `speak()` becomes a silent no-op and any
 * in-progress utterance is cancelled.
 */
export function setTtsEnabled(enabled: boolean): void {
  _ttsEnabled = enabled;
  if (!enabled) cancel();
}

/**
 * Set the master mute state for speech.
 * When muted, `speak()` becomes a silent no-op and any
 * in-progress utterance is cancelled.
 */
export function setSpeechMuted(muted: boolean): void {
  _speechMuted = muted;
  if (muted) cancel();
}

/**
 * Returns whether TTS is globally enabled.
 */
export function isTtsEnabled(): boolean {
  return _ttsEnabled;
}

/**
 * Returns whether speech is master-muted.
 */
export function isSpeechMuted(): boolean {
  return _speechMuted;
}
