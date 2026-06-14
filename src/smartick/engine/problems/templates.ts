import type {
  GeneratorContext,
  GeneratorResult,
  ProblemGenerator,
  SubSkillId,
} from "../types";
import { multiplicationGenerators } from "./multiplication";
import { divisionGenerators } from "./division";
import { divisionRemainderGenerators } from "./division-remainder";
import { geometryGenerators } from "./geometry";
import { measurementGenerators } from "./measurement";
import { timeMoneyGenerators } from "./time-money";
import { estimationGenerators } from "./estimation";
import { capMassGenerators } from "./cap-mass-problems";

// ──────────────────────────────────────────────
// Seeded Pseudo-Random Number Generator
// ──────────────────────────────────────────────

/**
 * Mulberry32 — a fast, seedable 32-bit PRNG.
 * Returns a function that yields values in [0, 1).
 */
export function createSeededRng(seed: number): () => number {
  let s = seed | 0;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Deterministic random integer in [min, max] (both inclusive).
 */
export function rngInt(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

/**
 * Deterministic random pick from an array.
 */
export function rngPick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

/**
 * Fisher-Yates shuffle using the seeded RNG (returns a new array).
 */
export function rngShuffle<T>(rng: () => number, arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// ──────────────────────────────────────────────
// Distractor Helpers
// ──────────────────────────────────────────────

/**
 * Generate N distinct plausible distractors for a multiple-choice problem.
 *
 * Strategy:
 * 1. Add common-error candidates first (off-by-1, operation confusion, etc.)
 * 2. Pad with ±random-offset fallback distractors if needed
 * 3. Hard-fallback with incremental offsets if still not enough
 *
 * All distractors are positive integers distinct from `correctAnswer`.
 */
export function generateDistractors(
  correctAnswer: number,
  count: number,
  rng: () => number,
  commonErrors: number[],
): number[] {
  const set = new Set<number>();

  // Stage 1 — plausible common errors
  for (const err of commonErrors) {
    if (set.size >= count) break;
    if (err !== correctAnswer && Number.isInteger(err) && err > 0) {
      set.add(err);
    }
  }

  // Stage 2 — ±random offset fallback
  let tries = 0;
  while (set.size < count && tries < 100) {
    tries++;
    const range = Math.max(Math.floor(correctAnswer * 0.3), 3);
    const offset = rngInt(rng, 1, range);
    const sign = rng() > 0.5 ? 1 : -1;
    const candidate = correctAnswer + sign * offset;
    if (candidate > 0 && candidate !== correctAnswer && !set.has(candidate)) {
      set.add(candidate);
    }
  }

  // Stage 3 — hard fallback (increment from 1)
  let fallback = 1;
  while (set.size < count) {
    const candidate = correctAnswer + fallback;
    if (candidate > 0 && !set.has(candidate)) {
      set.add(candidate);
    }
    fallback++;
  }

  return Array.from(set).slice(0, count);
}

// ──────────────────────────────────────────────
// Registry
// ──────────────────────────────────────────────

/**
 * Build a complete generator registry from all problem modules.
 */
export function buildGeneratorRegistry(): Record<SubSkillId, ProblemGenerator> {
  return {
    ...multiplicationGenerators,
    ...divisionGenerators,
    ...divisionRemainderGenerators,
    ...geometryGenerators,
    ...measurementGenerators,
    ...timeMoneyGenerators,
    ...estimationGenerators,
    ...capMassGenerators,
  } as Record<SubSkillId, ProblemGenerator>;
}

/** Singleton registry (lazy-built on first access). */
let _registry: Record<SubSkillId, ProblemGenerator> | null = null;

/**
 * Get the global problem generator registry.
 * Builds it once and caches it.
 */
export function getGeneratorRegistry(): Record<SubSkillId, ProblemGenerator> {
  if (!_registry) {
    _registry = buildGeneratorRegistry();
  }
  return _registry;
}

/**
 * Generate a problem for a given sub-skill and context.
 *
 * @param context - Generator context with seed, tier, phase, and identifying info
 * @returns The generated problem result (text, answer, type, options)
 * @throws If no generator is registered for the given sub-skill
 */
export function generateProblem(context: GeneratorContext): GeneratorResult {
  const registry = getGeneratorRegistry();
  const generator = registry[context.subSkillId];
  if (!generator) {
    throw new Error(
      `No hay generador registrado para la sub-habilidad: ${context.subSkillId}`,
    );
  }
  return generator(context);
}
