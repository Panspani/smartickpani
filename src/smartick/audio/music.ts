/**
 * Background music service using the Web Audio API.
 *
 * Plays a calming pentatonic melody loop using OscillatorNode + GainNode.
 * Module-level singleton following the same pattern as sounds.ts.
 * Volume is very low (~0.05) to serve as background texture only.
 *
 * @module audio/music
 */

// ──────────────────────────────────────────────
// State
// ──────────────────────────────────────────────

let _musicEnabled = true;
let _musicMuted = false;
let _audioCtx: AudioContext | null = null;
let _gain: GainNode | null = null;
let _timeoutId: ReturnType<typeof setTimeout> | null = null;
let _melodyIndex = 0;
let _fading = false;

// ──────────────────────────────────────────────
// Musical constants
// ──────────────────────────────────────────────

/** Pentatonic scale: C4-D4-E4-G4-A4-C5 (frequencies in Hz). */
const PENTATONIC = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25] as const;

/** Duration of each note in seconds. */
const NOTE_DURATION = 0.3;

/** Beats per minute — controls tempo of the melody. */
const BPM = 80;

/** Interval between note starts in milliseconds. */
const NOTE_INTERVAL_MS = (60 / BPM) * 1000;

/**
 * Simple pentatonic melody as indices into the PENTATONIC array.
 * 16 notes ≈ 2 bars at 4/4 time.
 */
const MELODY: readonly number[] = [0, 2, 3, 1, 4, 3, 2, 0, 3, 4, 5, 4, 2, 0, 1, 2];

// ──────────────────────────────────────────────
// Internal helpers
// ──────────────────────────────────────────────

/**
 * Schedule the next note in the melody and chain the subsequent note
 * via setTimeout for a continuous loop.
 */
function scheduleNextNote(): void {
  if (!_audioCtx || !_gain || !_musicEnabled || _musicMuted || _fading) {
    return;
  }

  const freq = PENTATONIC[MELODY[_melodyIndex % MELODY.length]];
  _melodyIndex++;

  const now = _audioCtx.currentTime;
  const osc = _audioCtx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(freq, now);
  osc.connect(_gain);

  osc.start(now);
  osc.stop(now + NOTE_DURATION);

  osc.onended = () => {
    osc.disconnect();
  };

  // Schedule the next note
  _timeoutId = setTimeout(scheduleNextNote, NOTE_INTERVAL_MS);
}

// ──────────────────────────────────────────────
// Public API
// ──────────────────────────────────────────────

/**
 * Start the background music loop.
 *
 * @param audioCtx - A shared Web Audio AudioContext (created elsewhere,
 *   typically from sounds.ts on first user gesture).
 *
 * The loop plays a pentatonic melody at volume ~0.05.
 * If music is disabled or muted, this is a no-op.
 * Calling while already playing restarts the loop cleanly.
 */
export function startMusic(audioCtx: AudioContext): void {
  if (!_musicEnabled || _musicMuted) return;

  // Ensure clean state before starting
  stopMusicInternal(false);

  _audioCtx = audioCtx;
  _fading = false;

  _gain = audioCtx.createGain();
  _gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
  _gain.connect(audioCtx.destination);

  _melodyIndex = 0;
  scheduleNextNote();
}

/**
 * Stop the background music loop with a smooth fade-out (≤500ms).
 */
export function stopMusic(): void {
  stopMusicInternal(true);
}

/**
 * Internal stop with optional fade-out.
 *
 * @param fade - If true, apply a 500ms gain ramp to 0 before cleanup.
 */
function stopMusicInternal(fade: boolean): void {
  if (_timeoutId !== null) {
    clearTimeout(_timeoutId);
    _timeoutId = null;
  }

  _fading = true;

  if (fade && _gain && _audioCtx) {
    try {
      _gain.gain.cancelScheduledValues(_audioCtx.currentTime);
      _gain.gain.setValueAtTime(_gain.gain.value, _audioCtx.currentTime);
      _gain.gain.linearRampToValueAtTime(0, _audioCtx.currentTime + 0.5);
    } catch {
      // Ignore errors during fade scheduling (e.g., closed context)
    }
  }

  _melodyIndex = 0;

  // Schedule full cleanup after fade completes
  const delay = fade ? 600 : 0;
  setTimeout(() => {
    if (_gain) {
      try {
        _gain.disconnect();
      } catch {
        // Ignore disconnect errors
      }
      _gain = null;
    }
    _audioCtx = null;
    _fading = false;
  }, delay);
}

/**
 * Set the master mute state for background music.
 * When muted, music stops immediately. When unmuted, music resumes
 * if `musicEnabled` is still true and the AudioContext is available.
 */
export function setMusicMuted(muted: boolean): void {
  _musicMuted = muted;
  if (muted) {
    stopMusicInternal(false);
  }
  // Note: unmute does NOT auto-restart — the consumer must call startMusic()
  // with a valid AudioContext. This avoids starting audio without a gesture.
}

/**
 * Enable or disable background music globally (feature gate).
 * When disabled, music stops and `startMusic()` becomes a no-op.
 */
export function setMusicEnabled(enabled: boolean): void {
  _musicEnabled = enabled;
  if (!enabled) {
    stopMusicInternal(false);
  }
}

/**
 * Returns whether background music is globally enabled.
 */
export function isMusicEnabled(): boolean {
  return _musicEnabled;
}

/**
 * Returns whether music is master-muted.
 */
export function isMusicMuted(): boolean {
  return _musicMuted;
}
