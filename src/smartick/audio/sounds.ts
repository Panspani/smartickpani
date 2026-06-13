/**
 * Web Audio API sound synthesis for Smartick Math Sessions.
 *
 * All sounds are generated programmatically — no external audio files.
 * AudioContext is created lazily (on first call) and resumed on user gesture.
 *
 * Frecuencias de referencia (temperamento igual, A4 = 440 Hz):
 *   C5 = 523.25 Hz
 *   D5 = 587.33 Hz
 *   E5 = 659.25 Hz
 *   G3 = 196.00 Hz
 *   G4 = 392.00 Hz
 *   G5 = 783.99 Hz
 *   C6 = 1046.50 Hz
 */

// ──────────────────────────────────────────────
// State
// ──────────────────────────────────────────────

let audioCtx: AudioContext | null = null;
let _muted = false;
let _initialized = false;

// ──────────────────────────────────────────────
// AudioContext Management
// ──────────────────────────────────────────────

/**
 * Lazy-initialize the AudioContext.
 * Must be called from a user-gesture handler (click, tap) to satisfy
 * browser autoplay policies. After the first call the context is cached.
 */
export function createAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === "suspended") {
    void audioCtx.resume();
  }
  _initialized = true;
  return audioCtx;
}

/**
 * Returns true if the AudioContext has been initialized at least once.
 */
export function isAudioInitialized(): boolean {
  return _initialized;
}

/**
 * Get the current AudioContext (may be null if not yet initialized).
 */
export function getAudioContext(): AudioContext | null {
  return audioCtx;
}

// ──────────────────────────────────────────────
// Mute Control
// ──────────────────────────────────────────────

/**
 * Set the muted state. When muted, all play* functions are no-ops.
 */
export function setMuted(muted: boolean): void {
  _muted = muted;
}

/**
 * Returns the current muted state.
 */
export function isMuted(): boolean {
  return _muted;
}

// ──────────────────────────────────────────────
// Internal Helpers
// ──────────────────────────────────────────────

/**
 * Helper: play a single tone.
 *
 * @param ctx   - AudioContext
 * @param freq  - Frequency in Hz
 * @param dur   - Duration in seconds
 * @param start - Start time (ctx.currentTime + offset)
 * @param type  - Oscillator type (default 'sine')
 * @param vol   - Peak gain (0–1, default 0.25)
 */
function tone(
  ctx: AudioContext,
  freq: number,
  dur: number,
  start: number,
  type: OscillatorType = "sine",
  vol: number = 0.25,
): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);

  // Attack
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(vol, start + 0.01);
  // Decay / release
  gain.gain.exponentialRampToValueAtTime(0.001, start + dur);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(start);
  osc.stop(start + dur + 0.05);
}

/**
 * Ensure the AudioContext is ready. If called without a prior user gesture,
 * it will attempt to create/resume the context (may fail silently in some
 * browsers until a real gesture event).
 */
function ensureAudio(): AudioContext | null {
  if (_muted) return null;
  try {
    return createAudioContext();
  } catch {
    return null;
  }
}

// ──────────────────────────────────────────────
// Public Sound API
// ──────────────────────────────────────────────

/**
 * Play a rising two-tone chime: C5 → E5, 200 ms total.
 * Used for correct answers.
 */
export function playCorrect(): void {
  const ctx = ensureAudio();
  if (!ctx) return;

  const now = ctx.currentTime;
  // C5 (523.25 Hz) — first tone, 150 ms
  tone(ctx, 523.25, 0.15, now, "sine", 0.25);
  // E5 (659.25 Hz) — second tone, starts 100 ms after first
  tone(ctx, 659.25, 0.15, now + 0.1, "sine", 0.25);
}

/**
 * Play a single low tone: G3 (196 Hz), 300 ms.
 * Gentle triangle wave — not punishing.
 * Used for incorrect answers.
 */
export function playIncorrect(): void {
  const ctx = ensureAudio();
  if (!ctx) return;

  const now = ctx.currentTime;
  // G3 (196 Hz), triangle wave for a softer sound
  tone(ctx, 196.0, 0.3, now, "triangle", 0.2);
}

/**
 * Play a three-tone ascending arpeggio: C5 → E5 → G5, 400 ms total.
 * Used for streak milestones, badge earned, and celebratory events.
 */
export function playMilestone(): void {
  const ctx = ensureAudio();
  if (!ctx) return;

  const now = ctx.currentTime;
  // C5
  tone(ctx, 523.25, 0.16, now, "sine", 0.25);
  // E5 — 120 ms after C5
  tone(ctx, 659.25, 0.16, now + 0.12, "sine", 0.25);
  // G5 — 240 ms after C5
  tone(ctx, 783.99, 0.2, now + 0.24, "sine", 0.28);
}

/**
 * Play a rising series of short tones.
 * Used to acknowledge a growing streak (every correct answer after 3).
 */
export function playStreak(): void {
  const ctx = ensureAudio();
  if (!ctx) return;

  const now = ctx.currentTime;
  // Four quick rising tones: C5 → D5 → E5 → G5
  tone(ctx, 523.25, 0.1, now, "sine", 0.2);
  tone(ctx, 587.33, 0.1, now + 0.08, "sine", 0.2);
  tone(ctx, 659.25, 0.1, now + 0.16, "sine", 0.22);
  tone(ctx, 783.99, 0.14, now + 0.24, "sine", 0.25);
}

/**
 * Play a triumphant completion fanfare.
 * Used when the session ends successfully.
 *
 * Sequence: C5 → E5 → G5 → C6 (full octave rise), 600 ms total.
 */
export function playSessionEnd(): void {
  const ctx = ensureAudio();
  if (!ctx) return;

  const now = ctx.currentTime;
  // C5
  tone(ctx, 523.25, 0.18, now, "sine", 0.25);
  // E5
  tone(ctx, 659.25, 0.18, now + 0.12, "sine", 0.25);
  // G5
  tone(ctx, 783.99, 0.2, now + 0.24, "sine", 0.27);
  // C6 — final triumphant note, held longer
  tone(ctx, 1046.5, 0.35, now + 0.38, "sine", 0.3);
}

// ──────────────────────────────────────────────
// Cleanup
// ──────────────────────────────────────────────

/**
 * Close and discard the current AudioContext.
 * Useful for testing or hard reset.
 */
export function disposeAudio(): void {
  if (audioCtx && audioCtx.state !== "closed") {
    void audioCtx.close();
  }
  audioCtx = null;
  _initialized = false;
}
