/**
 * Sound playback using pre-encoded Base64 WAV samples.
 *
 * All 5 sound samples are pre-rendered as WAV bytes at module init,
 * then converted to Base64 data URLs. On first play, each data URL
 * is decoded into an AudioBuffer and cached. No real-time synthesis.
 *
 * Frecuencias de referencia (temperamento igual, A4 = 440 Hz):
 *   C5 = 523.25 Hz   D5 = 587.33 Hz   E5 = 659.25 Hz
 *   G3 = 196.00 Hz   G4 = 392.00 Hz   G5 = 783.99 Hz
 *   C6 = 1046.50 Hz
 */

// ──────────────────────────────────────────────
// State
// ──────────────────────────────────────────────

let audioCtx: AudioContext | null = null;
let _muted = false;
let _initialized = false;

/** Base64 data URLs for each sample (pre-encoded at module init). */
const sampleDataUrls = new Map<string, string>();

/** Cached AudioBuffers for each sample (lazy-decoded from data URL). */
const bufferCache = new Map<string, AudioBuffer>();

// ──────────────────────────────────────────────
// WAV Generation (8 kHz, 8-bit unsigned PCM)
// ──────────────────────────────────────────────

interface ToneSpec {
  freq: number;
  startMs: number;
  durMs: number;
  vol: number; // 0–1
  type: "sine" | "triangle";
}

/**
 * Generate a WAV file as a Uint8Array from a list of tone specifications.
 * Returns complete WAV bytes (header + PCM data).
 */
function generateWav(specs: ToneSpec[], totalMs: number): Uint8Array {
  const SAMPLE_RATE = 8000;
  const numSamples = Math.ceil((SAMPLE_RATE * totalMs) / 1000);
  const headerSize = 44;
  const buf = new Uint8Array(headerSize + numSamples);
  const dv = new DataView(buf.buffer);

  // ── RIFF header ───────────────────────────
  writeStr(dv, 0, "RIFF");
  dv.setUint32(4, 36 + numSamples, true);
  writeStr(dv, 8, "WAVE");

  // ── fmt chunk ─────────────────────────────
  writeStr(dv, 12, "fmt ");
  dv.setUint32(16, 16, true); // chunk size
  dv.setUint16(20, 1, true); // PCM
  dv.setUint16(22, 1, true); // mono
  dv.setUint32(24, SAMPLE_RATE, true);
  dv.setUint32(28, SAMPLE_RATE, true); // byte rate
  dv.setUint16(32, 1, true); // block align
  dv.setUint16(34, 8, true); // bits per sample

  // ── data chunk ────────────────────────────
  writeStr(dv, 36, "data");
  dv.setUint32(40, numSamples, true);

  // ── Generate PCM samples ──────────────────
  for (let i = 0; i < numSamples; i++) {
    const tMs = (i / SAMPLE_RATE) * 1000;
    let sample = 128; // 8-bit zero = 128

    for (const spec of specs) {
      const localT = tMs - spec.startMs;
      if (localT < 0 || localT >= spec.durMs) continue;

      const phase = 2 * Math.PI * spec.freq * (localT / 1000);
      let value: number;

      if (spec.type === "triangle") {
        value = (2 / Math.PI) * Math.asin(Math.sin(phase));
      } else {
        value = Math.sin(phase);
      }

      // Apply amplitude envelope (quick attack, slow release)
      const attack = Math.min(1, localT / 0.008);
      const release = Math.min(1, (spec.durMs - localT) / 0.015);
      const envelope = attack * release;

      sample += spec.vol * 127 * value * envelope;
    }

    buf[headerSize + i] = Math.max(0, Math.min(255, Math.round(sample)));
  }

  return buf;
}

function writeStr(dv: DataView, offset: number, str: string): void {
  for (let i = 0; i < str.length; i++) {
    dv.setUint8(offset + i, str.charCodeAt(i));
  }
}

/** Convert a Uint8Array to a Base64 data URL for WAV audio. */
function wavToDataUrl(wav: Uint8Array): string {
  let binary = "";
  const chunkSize = 8192;
  for (let i = 0; i < wav.length; i += chunkSize) {
    binary += String.fromCharCode(...wav.subarray(i, i + chunkSize));
  }
  return "data:audio/wav;base64," + btoa(binary);
}

// ──────────────────────────────────────────────
// Sample definitions
// ──────────────────────────────────────────────

const SAMPLE_DEFS: Record<string, { specs: ToneSpec[]; totalMs: number }> = {
  correct: {
    specs: [
      { freq: 523.25, startMs: 0, durMs: 160, vol: 0.35, type: "sine" },
      { freq: 659.25, startMs: 80, durMs: 160, vol: 0.35, type: "sine" },
    ],
    totalMs: 240,
  },
  incorrect: {
    specs: [
      { freq: 196.0, startMs: 0, durMs: 300, vol: 0.3, type: "triangle" },
    ],
    totalMs: 320,
  },
  milestone: {
    specs: [
      { freq: 523.25, startMs: 0, durMs: 180, vol: 0.35, type: "sine" },
      { freq: 659.25, startMs: 120, durMs: 180, vol: 0.35, type: "sine" },
      { freq: 783.99, startMs: 240, durMs: 220, vol: 0.38, type: "sine" },
    ],
    totalMs: 460,
  },
  streak: {
    specs: [
      { freq: 523.25, startMs: 0, durMs: 120, vol: 0.3, type: "sine" },
      { freq: 587.33, startMs: 80, durMs: 120, vol: 0.3, type: "sine" },
      { freq: 659.25, startMs: 160, durMs: 120, vol: 0.32, type: "sine" },
      { freq: 783.99, startMs: 240, durMs: 160, vol: 0.35, type: "sine" },
    ],
    totalMs: 400,
  },
  "session-end": {
    specs: [
      { freq: 523.25, startMs: 0, durMs: 200, vol: 0.35, type: "sine" },
      { freq: 659.25, startMs: 120, durMs: 200, vol: 0.35, type: "sine" },
      { freq: 783.99, startMs: 240, durMs: 220, vol: 0.37, type: "sine" },
      { freq: 1046.5, startMs: 380, durMs: 350, vol: 0.4, type: "sine" },
    ],
    totalMs: 740,
  },
};

// ── Pre-render all samples to Base64 data URLs at module init ──
for (const [name, def] of Object.entries(SAMPLE_DEFS)) {
  const wav = generateWav(def.specs, def.totalMs);
  sampleDataUrls.set(name, wavToDataUrl(wav));
}

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
// Sample initialization & playback
// ──────────────────────────────────────────────

/**
 * Decode a Base64 data URL into an AudioBuffer synchronously.
 * WAV is simple PCM, so we can do this without async decodeAudioData.
 */
function decodeDataUrlToAudioBuffer(ctx: AudioContext, dataUrl: string): AudioBuffer {
  // Decode Base64 to binary string
  const base64 = dataUrl.split(",")[1];
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  // Parse WAV (skip 44-byte header)
  const SAMPLE_RATE = 8000;
  const dataOffset = 44;
  const numSamples = bytes.length - dataOffset;
  const audioBuffer = ctx.createBuffer(1, numSamples, SAMPLE_RATE);
  const channelData = audioBuffer.getChannelData(0);

  for (let i = 0; i < numSamples; i++) {
    channelData[i] = (bytes[dataOffset + i] - 128) / 128;
  }

  return audioBuffer;
}

/**
 * Ensure a specific sample is decoded and cached.
 * Returns the AudioBuffer, or null if muted / no context.
 */
function ensureSample(name: string): AudioBuffer | null {
  if (_muted) return null;

  // Check cache first
  const cached = bufferCache.get(name);
  if (cached) return cached;

  const dataUrl = sampleDataUrls.get(name);
  if (!dataUrl) return null;

  const ctx = createAudioContext();
  if (!ctx) return null;

  const audioBuffer = decodeDataUrlToAudioBuffer(ctx, dataUrl);
  bufferCache.set(name, audioBuffer);
  return audioBuffer;
}

/**
 * Play a pre-encoded sample by name.
 */
function playSample(name: string): void {
  if (_muted) return;

  const buffer = ensureSample(name);
  if (!buffer || !audioCtx) return;

  const source = audioCtx.createBufferSource();
  source.buffer = buffer;
  source.connect(audioCtx.destination);
  source.start();
}

// ──────────────────────────────────────────────
// Public Sound API
// ──────────────────────────────────────────────

/**
 * Play a rising two-tone chime: C5 → E5.
 * Used for correct answers.
 */
export function playCorrect(): void {
  playSample("correct");
}

/**
 * Play a single low tone: G3 (196 Hz), gentle triangle.
 * Used for incorrect answers - soft, not punitive.
 */
export function playIncorrect(): void {
  playSample("incorrect");
}

/**
 * Play a three-tone ascending arpeggio: C5 → E5 → G5.
 * Used for streak milestones, badge earned, and celebrations.
 */
export function playMilestone(): void {
  playSample("milestone");
}

/**
 * Play a rising series of four tones: C5 → D5 → E5 → G5.
 * Used to acknowledge a growing streak.
 */
export function playStreak(): void {
  playSample("streak");
}

/**
 * Play a triumphant completion fanfare: C5 → E5 → G5 → C6.
 * Used when the session ends successfully.
 */
export function playSessionEnd(): void {
  playSample("session-end");
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
  bufferCache.clear();
}
