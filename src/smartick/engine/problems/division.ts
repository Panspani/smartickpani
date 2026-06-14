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
import { generateDivisionScene } from "../scenes/division";

// ──────────────────────────────────────────────
// Skill-06-01: Divisiones exactas (por 1 cifra)
// ──────────────────────────────────────────────

/**
 * Genera una división exacta: dividendo ÷ divisor = cociente.
 * El dividendo se calcula como divisor × cociente para garantizar exactitud.
 */
function generadorDivExactas(ctx: GeneratorContext): GeneratorResult {
  const rng = createSeededRng(ctx.seed + ctx.sessionProblemIndex * 31 + 1);

  let divisor: number;
  let cociente: number;

  switch (ctx.tier) {
    case 1: {
      // EASY: ÷2 ÷5 ÷10, dividendo ≤ 20
      divisor = rngPick(rng, [2, 5, 10]);
      cociente = rngInt(rng, 1, Math.floor(20 / divisor));
      break;
    }
    case 2: {
      // MEDIUM: ÷3 ÷4 ÷6, dividendo ≤ 50
      divisor = rngPick(rng, [3, 4, 6]);
      cociente = rngInt(rng, 2, Math.floor(50 / divisor));
      break;
    }
    default: {
      // HARD: ÷7 ÷8 ÷9, dividendo ≤ 81
      divisor = rngPick(rng, [7, 8, 9]);
      cociente = rngInt(rng, 2, Math.floor(81 / divisor));
      break;
    }
  }

  const dividendo = divisor * cociente;

  // Rotación de formatos
  const templates = [
    `${dividendo} ÷ ${divisor} = ?`,
    `¿Cuánto es ${dividendo} ÷ ${divisor}?`,
  ];
  const text = rngPick(rng, templates);

  const errors = [
    cociente + 1,
    cociente - 1,
    divisor,
    dividendo,
    cociente + divisor,
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
// Skill-06-02: Relación multiplicación-división
// ──────────────────────────────────────────────

/**
 * Formato de factor faltante: ___ × divisor = producto
 * Genera el inverso de una multiplicación conocida.
 */
function generadorRelacionMult(ctx: GeneratorContext): GeneratorResult {
  const rng = createSeededRng(ctx.seed + ctx.sessionProblemIndex * 37 + 1);

  let multiplicando: number;
  let divisor: number;

  switch (ctx.tier) {
    case 1: {
      // EASY: tablas pequeñas
      multiplicando = rngInt(rng, 2, 5);
      divisor = rngInt(rng, 2, 5);
      break;
    }
    case 2: {
      // MEDIUM: tablas medianas
      multiplicando = rngInt(rng, 4, 7);
      divisor = rngInt(rng, 4, 8);
      break;
    }
    default: {
      // HARD: tablas grandes, incluyendo 8-10
      multiplicando = rngInt(rng, 6, 10);
      divisor = rngInt(rng, 6, 10);
      break;
    }
  }

  const producto = multiplicando * divisor;

  // Rotar entre ___ × d = p  y  d × ___ = p
  const templates = [
    `___ × ${divisor} = ${producto}`,
    `${divisor} × ___ = ${producto}`,
    `${producto} ÷ ${divisor} = ?`,
    `${producto} ÷ ? = ${divisor}`,
  ];
  const index = ctx.sessionProblemIndex % templates.length;
  const text = templates[index];

  // Para formato de división, la respuesta es el cociente
  const answer =
    index === 0 || index === 1
      ? multiplicando
      : index === 2
        ? multiplicando
        : divisor;

  const errors = [
    answer + 1,
    answer - 1,
    producto - answer,
    divisor + 1,
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
// Skill-06-03: Problemas de división
// ──────────────────────────────────────────────

const CONTEXTOS_DIV = [
  "caramelos",
  "pegatinas",
  "galletas",
  "lápices",
  "canicas",
  "cromos",
  "manzanas",
  "globos",
];

function generadorDivProblemas(ctx: GeneratorContext): GeneratorResult {
  const rng = createSeededRng(ctx.seed + ctx.sessionProblemIndex * 41 + 1);
  const contexto = ctx.sessionProblemIndex % CONTEXTOS_DIV.length;
  const cosa = CONTEXTOS_DIV[contexto];

  let text: string;
  let answer: number;
  let grupos = 0;

  switch (ctx.tier) {
    case 1: {
      // EASY: reparto exacto con 2, 3, 5 amigos
      const total = rngInt(rng, 6, 20);
      const amigos = rngPick(rng, [2, 3, 5]);
      // Ajustar total para que sea divisible
      const ajustado = Math.floor(total / amigos) * amigos;
      grupos = amigos;
      answer = ajustado / amigos;
      text = `Ana reparte ${ajustado} ${cosa} entre ${amigos} amigos, en partes iguales. ¿Cuántos ${cosa} le tocan a cada uno?`;
      break;
    }
    case 2: {
      // MEDIUM: reparto exacto con 3, 4, 6, 7
      const total = rngInt(rng, 12, 48);
      const amigos = rngPick(rng, [3, 4, 6, 7]);
      const ajustado = Math.floor(total / amigos) * amigos;
      grupos = amigos;
      answer = ajustado / amigos;
      text = `Hay ${ajustado} ${cosa} para repartir entre ${amigos} niños. Cada niño recibe la misma cantidad. ¿Cuántos ${cosa} recibe cada uno?`;
      break;
    }
    default: {
      // HARD: reparto con divisores más grandes
      grupos = rngPick(rng, [8, 9, 10]);
      const total = rngInt(rng, 24, 80);
      const ajustado = Math.floor(total / grupos) * grupos;
      answer = ajustado / grupos;
      text = `La maestra tiene ${ajustado} ${cosa} y los quiere repartir en ${grupos} grupos iguales. ¿Cuántos ${cosa} pone en cada grupo?`;
      break;
    }
  }

  const errors = [
    answer + 1,
    answer - 1,
    answer + 2,
  ];

  const options = generateDistractors(answer, 3, rng, errors);

  const sceneData = generateDivisionScene(answer * grupos, grupos, answer, ctx.seed);

  return {
    text,
    answer,
    type: "multiple-choice",
    options: rngShuffle(rng, [...options, answer]),
    sceneData,
  };
}

// ──────────────────────────────────────────────
// Registry Export
// ──────────────────────────────────────────────

export const divisionGenerators: Partial<
  Record<SubSkillId, ProblemGenerator>
> = {
  [SUB_SKILL_IDS.DIV_EXACTAS]: generadorDivExactas,
  [SUB_SKILL_IDS.DIV_RELACION_MULT]: generadorRelacionMult,
  [SUB_SKILL_IDS.DIV_PROBLEMAS]: generadorDivProblemas,
};
