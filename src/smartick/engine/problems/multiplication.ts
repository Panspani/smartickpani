import type {
  GeneratorContext,
  GeneratorResult,
  ProblemGenerator,
  SubSkillId,
} from "../types";
import { SUB_SKILL_IDS } from "../types";
import {
  createSeededRng,
  rngInt,
  rngPick,
  rngShuffle,
  generateDistractors,
} from "./templates";

// ──────────────────────────────────────────────
// Skill-05-01: Tablas del 1 al 10
// ──────────────────────────────────────────────

function generadorTablas(ctx: GeneratorContext): GeneratorResult {
  const rng = createSeededRng(ctx.seed + ctx.sessionProblemIndex * 13 + 1);

  let a: number;
  let b: number;

  switch (ctx.tier) {
    case 1: {
      // EASY: tablas 2–4, factores 2–5, producto ≤ 25
      a = rngInt(rng, 2, 4);
      b = rngInt(rng, 2, 5);
      break;
    }
    case 2: {
      // MEDIUM: tablas 5–7, factores 4–9, producto ≤ 81
      a = rngInt(rng, 5, 7);
      b = rngInt(rng, 4, 9);
      break;
    }
    default: {
      // HARD: tablas 8–10, factores 6–10, producto ≤ 100
      a = rngInt(rng, 8, 10);
      b = rngInt(rng, 6, 10);
      break;
    }
  }

  // Multiplicación conmutativa: alternar orden
  if (rng() > 0.5) {
    [a, b] = [b, a];
  }

  const product = a * b;

  // Rotación de formatos
  const templates = tier3Templates(ctx.tier, a, b, product);
  const index = ctx.sessionProblemIndex % templates.length;
  const text = templates[index];

  // Distractores: errores comunes
  const errors = [
    product + 1,
    product - 1,
    a + b,
    (a + 1) * b,
    a * (b + 1),
    a * b + a,
    a * b + b,
  ];

  const options = generateDistractors(product, 3, rng, errors);

  return {
    text,
    answer: product,
    type: "multiple-choice",
    options: rngShuffle(rng, [...options, product]),
  };
}

function tier3Templates(tier: number, a: number, b: number, p: number): string[] {
  const direct = `${a} × ${b} = ?`;
  if (tier === 3 && a > 3 && b > 3) {
    return [
      direct,
      `${b} × ${a} = ?`,
      `¿Cuánto es ${a} × ${b}?`,
      `${a} veces ${b} = ?`,
    ];
  }
  return [
    direct,
    `${b} × ${a} = ?`,
    `¿Cuánto es ${a} × ${b}?`,
  ];
}

// ──────────────────────────────────────────────
// Skill-05-02: Multiplicaciones por 1 cifra
// ──────────────────────────────────────────────

function generadorMult1Cifra(ctx: GeneratorContext): GeneratorResult {
  const rng = createSeededRng(ctx.seed + ctx.sessionProblemIndex * 17 + 1);

  let multiplicando: number;
  let multiplicador: number;

  switch (ctx.tier) {
    case 1: {
      // EASY: 2 dígitos × 1 dígito, sin llevar
      // Ej: 23 × 2 = 46  (cada dígito × 2 < 10)
      const d1 = rngInt(rng, 1, 4);
      const d0 = rngInt(rng, 1, 4);
      multiplicando = d1 * 10 + d0;
      multiplicador = rngInt(rng, 2, 4);
      break;
    }
    case 2: {
      // MEDIUM: 2 dígitos × 1 dígito, con llevada
      const d1 = rngInt(rng, 1, 9);
      const d0 = rngInt(rng, 5, 9);
      multiplicando = d1 * 10 + d0;
      multiplicador = rngInt(rng, 3, 7);
      break;
    }
    default: {
      // HARD: 3 dígitos × 1 dígito
      const d2 = rngInt(rng, 1, 4);
      const d1 = rngInt(rng, 0, 9);
      const d0 = rngInt(rng, 1, 9);
      multiplicando = d2 * 100 + d1 * 10 + d0;
      multiplicador = rngInt(rng, 3, 9);
      break;
    }
  }

  const answer = multiplicando * multiplicador;

  const templates = [
    `${multiplicando} × ${multiplicador} = ?`,
    `¿Cuánto es ${multiplicando} × ${multiplicador}?`,
  ];
  const text = rngPick(rng, templates);

  const errors = [
    answer + 1,
    answer - 1,
    multiplicando + multiplicador,
    multiplicando * (multiplicador - 1),
    (multiplicando + 1) * multiplicador,
  ];

  const options = generateDistractors(answer, 3, rng, errors);

  return {
    text,
    answer,
    type: "multiple-choice",
    options: rngShuffle(rng, [...options, answer]),
  };
}

// ──────────────────────────────────────────────
// Skill-05-03: Multiplicaciones por 2 cifras
// ──────────────────────────────────────────────

function generadorMult2Cifras(ctx: GeneratorContext): GeneratorResult {
  const rng = createSeededRng(ctx.seed + ctx.sessionProblemIndex * 23 + 1);

  let a: number;
  let b: number;

  switch (ctx.tier) {
    case 1: {
      // EASY: 2 dígitos × 10/20/30
      const base = rngInt(rng, 11, 45);
      const mult = rngPick(rng, [10, 20, 30]);
      a = base;
      b = mult;
      break;
    }
    case 2: {
      // MEDIUM: 2 dígitos × 2 dígitos, sin llevar
      const d1a = rngInt(rng, 1, 4);
      const d0a = rngInt(rng, 1, 3);
      const d1b = rngInt(rng, 1, 3);
      const d0b = rngInt(rng, 1, 3);
      a = d1a * 10 + d0a;
      b = d1b * 10 + d0b;
      break;
    }
    default: {
      // HARD: 2 dígitos × 2 dígitos (cualquiera)
      a = rngInt(rng, 12, 49);
      b = rngInt(rng, 12, 49);
      break;
    }
  }

  const answer = a * b;

  const templates = [
    `${a} × ${b} = ?`,
    `¿Cuánto es ${a} × ${b}?`,
  ];
  const text = rngPick(rng, templates);

  const errors = [
    answer + 1,
    answer - a,
    answer - b,
    a * (b - 1),
    (a - 1) * b,
  ];

  const options = generateDistractors(answer, 3, rng, errors);

  return {
    text,
    answer,
    type: "multiple-choice",
    options: rngShuffle(rng, [...options, answer]),
  };
}

// ──────────────────────────────────────────────
// Skill-05-04: Problemas de multiplicación
// ──────────────────────────────────────────────

const CONTEXTOS_MULT = [
  "pegatinas",
  "caramelos",
  "juguetes",
  "libros",
  "galletas",
  "manzanas",
  "lápices",
  "cromos",
];

function generadorMultProblemas(ctx: GeneratorContext): GeneratorResult {
  const rng = createSeededRng(ctx.seed + ctx.sessionProblemIndex * 29 + 1);
  const contexto = ctx.sessionProblemIndex % CONTEXTOS_MULT.length;
  const cosa = CONTEXTOS_MULT[contexto];

  let text: string;
  let answer: number;

  switch (ctx.tier) {
    case 1: {
      // EASY: grupos pequeños, multiplicador 2–4
      const grupos = rngInt(rng, 2, 4);
      const porGrupo = rngInt(rng, 2, 5);
      answer = grupos * porGrupo;
      text = `Ana tiene ${grupos} bolsas con ${porGrupo} ${cosa} cada una. ¿Cuántos ${cosa} tiene en total?`;
      break;
    }
    case 2: {
      // MEDIUM: grupos más grandes
      const grupos = rngInt(rng, 3, 7);
      const porGrupo = rngInt(rng, 3, 8);
      answer = grupos * porGrupo;
      text = `En la fiesta hay ${grupos} platos con ${porGrupo} ${cosa} cada uno. ¿Cuántos ${cosa} hay en total?`;
      break;
    }
    default: {
      // HARD: situaciones de arrays / repetición
      const filas = rngInt(rng, 4, 9);
      const columnas = rngInt(rng, 4, 9);
      answer = filas * columnas;
      text = `Ana organiza sus ${cosa} en ${filas} filas y ${columnas} columnas. ¿Cuántos ${cosa} tiene en total?`;
      break;
    }
  }

  return {
    text,
    answer,
    type: "numeric-input",
  };
}

// ──────────────────────────────────────────────
// Registry Export
// ──────────────────────────────────────────────

export const multiplicationGenerators: Partial<
  Record<SubSkillId, ProblemGenerator>
> = {
  [SUB_SKILL_IDS.TABLAS_1_10]: generadorTablas,
  [SUB_SKILL_IDS.MULT_1_CIFRA]: generadorMult1Cifra,
  [SUB_SKILL_IDS.MULT_2_CIFRAS]: generadorMult2Cifras,
  [SUB_SKILL_IDS.MULT_PROBLEMAS]: generadorMultProblemas,
};
