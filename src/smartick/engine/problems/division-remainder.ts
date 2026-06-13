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
// Skill-07-01: Divisiones con resto
// ──────────────────────────────────────────────

/**
 * Genera una división NO exacta: dividendo ÷ divisor = cociente, resto > 0.
 * El dividendo = divisor × cociente + resto, con 0 < resto < divisor.
 */
function generadorDivConResto(ctx: GeneratorContext): GeneratorResult {
  const rng = createSeededRng(ctx.seed + ctx.sessionProblemIndex * 43 + 1);

  let divisor: number;
  let dividendo: number;

  switch (ctx.tier) {
    case 1: {
      // EASY: ÷2 ÷5, dividendo ≤ 30
      divisor = rngPick(rng, [2, 5]);
      const cociente = rngInt(rng, 3, Math.floor(29 / divisor));
      const resto = rngInt(rng, 1, divisor - 1);
      dividendo = divisor * cociente + resto;
      break;
    }
    case 2: {
      // MEDIUM: ÷3 ÷4, dividendo ≤ 60
      divisor = rngPick(rng, [3, 4]);
      const cociente = rngInt(rng, 4, Math.floor(59 / divisor));
      const resto = rngInt(rng, 1, divisor - 1);
      dividendo = divisor * cociente + resto;
      break;
    }
    default: {
      // HARD: ÷6 ÷7 ÷8 ÷9, dividendo ≤ 100
      divisor = rngPick(rng, [6, 7, 8, 9]);
      const cociente = rngInt(rng, 4, Math.floor(99 / divisor));
      const resto = rngInt(rng, 1, divisor - 1);
      dividendo = divisor * cociente + resto;
      break;
    }
  }

  const cociente = Math.floor(dividendo / divisor);
  const resto = dividendo % divisor;

  // Preguntar cociente o resto de forma rotada
  const templates = [
    `${dividendo} ÷ ${divisor} = ? (resto ?)`,
    `¿Cuánto es ${dividendo} ÷ ${divisor}?`,
    `${dividendo} ÷ ${divisor}. ¿Cuál es el cociente?`,
    `${dividendo} ÷ ${divisor}. ¿Cuál es el resto?`,
  ];
  const index = ctx.sessionProblemIndex % 4;
  const text = templates[index];

  // Si se pregunta el resto, la respuesta es `resto`, si no el cociente
  const answer = index === 3 ? resto : cociente;

  const errors = [
    answer + 1,
    answer - 1,
    divisor,
    resto > 0 ? cociente + resto + 1 : cociente + 1,
    answer + divisor,
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
// Skill-07-02: Divisiones por 2 cifras
// ──────────────────────────────────────────────

function generadorDiv2Cifras(ctx: GeneratorContext): GeneratorResult {
  const rng = createSeededRng(ctx.seed + ctx.sessionProblemIndex * 47 + 1);

  let divisor: number;
  let cociente: number;

  switch (ctx.tier) {
    case 1: {
      // EASY: ÷10 ÷20, exactas
      divisor = rngPick(rng, [10, 20]);
      cociente = rngInt(rng, 2, 9);
      break;
    }
    case 2: {
      // MEDIUM: ÷11 ÷12 ÷15 ÷20 ÷25
      divisor = rngPick(rng, [11, 12, 15, 20, 25]);
      cociente = rngInt(rng, 2, 8);
      break;
    }
    default: {
      // HARD: ÷26 ÷30 ÷40 ÷50
      divisor = rngPick(rng, [26, 30, 40, 50]);
      cociente = rngInt(rng, 2, 6);
      break;
    }
  }

  const dividendo = divisor * cociente;

  const templates = [
    `${dividendo} ÷ ${divisor} = ?`,
    `¿Cuánto es ${dividendo} ÷ ${divisor}?`,
  ];
  const text = rngPick(rng, templates);

  const errors = [
    cociente + 1,
    cociente - 1,
    divisor,
    cociente + 2,
  ];

  const options = generateDistractors(cociente, 3, rng, errors);

  return {
    text,
    answer: cociente,
    type: "multiple-choice",
    options: rngShuffle(rng, [...options, cociente]),
  };
}

// ──────────────────────────────────────────────
// Skill-07-03: Problemas avanzados con división
// ──────────────────────────────────────────────

const CONTEXTOS_DIV_AVANZADOS = [
  "lápices",
  "cuadernos",
  "sillas",
  "flores",
  "huevos",
  "vasos",
  "platos",
  "galletas",
];

function generadorDivProblemasAvanzados(
  ctx: GeneratorContext,
): GeneratorResult {
  const rng = createSeededRng(ctx.seed + ctx.sessionProblemIndex * 53 + 1);
  const contexto = ctx.sessionProblemIndex % CONTEXTOS_DIV_AVANZADOS.length;
  const cosa = CONTEXTOS_DIV_AVANZADOS[contexto];

  let text: string;
  let answer: number;

  switch (ctx.tier) {
    case 1: {
      // EASY: reparto con resto pequeño, divisores 2, 3, 5
      const divisor = rngPick(rng, [2, 3, 5]);
      const cociente = rngInt(rng, 3, 8);
      const resto = rngInt(rng, 1, divisor - 1);
      const total = divisor * cociente + resto;
      answer = cociente;
      text = `Ana tiene ${total} ${cosa} y los quiere repartir entre ${divisor} amigos en partes iguales. Le sobran algunos. ¿Cuántos ${cosa} le da a cada amigo?`;
      break;
    }
    case 2: {
      // MEDIUM: interpretar el resto
      const divisor = rngPick(rng, [3, 4, 6]);
      const cociente = rngInt(rng, 4, 10);
      const resto = rngInt(rng, 1, divisor - 1);
      const total = divisor * cociente + resto;
      answer = resto;
      text = `Ana empaca ${total} ${cosa} en cajas de ${divisor}. Le sobran algunos. ¿Cuántos ${cosa} le sobran?`;
      break;
    }
    default: {
      // HARD: cuántos grupos completos se pueden formar
      const divisor = rngPick(rng, [3, 4, 5, 6]);
      const cociente = rngInt(rng, 3, 8);
      const resto = rngInt(rng, 1, divisor - 1);
      const total = divisor * cociente + resto;
      answer = cociente;
      text = `Con ${total} ${cosa}, ¿cuántos grupos de ${divisor} se pueden formar? Le sobrarán algunos.`;
      break;
    }
  }

  const errors = [
    answer + 1,
    answer - 1,
    answer + 2,
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
// Registry Export
// ──────────────────────────────────────────────

export const divisionRemainderGenerators: Partial<
  Record<SubSkillId, ProblemGenerator>
> = {
  [SUB_SKILL_IDS.DIV_CON_RESTO]: generadorDivConResto,
  [SUB_SKILL_IDS.DIV_2_CIFRAS]: generadorDiv2Cifras,
  [SUB_SKILL_IDS.DIV_PROBLEMAS_AVANZADOS]: generadorDivProblemasAvanzados,
};
