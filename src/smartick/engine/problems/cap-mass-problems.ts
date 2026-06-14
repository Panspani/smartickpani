import type {
  GeneratorContext,
  GeneratorResult,
  ProblemGenerator,
  SubSkillId,
  VisualData,
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
// Skill-10-04: Problemas de capacidad y masa
// ──────────────────────────────────────────────

const COSAS_LIQUIDO = ["agua", "jugo", "leche", "aceite", "refresco"];
const COSAS_SOLIDO = [
  "harina",
  "arroz",
  "azúcar",
  "papas",
  "manzanas",
  "naranjas",
];

const ITEMS_BALANZA = [
  "harina",
  "arroz",
  "azúcar",
  "papas",
  "manzanas",
];

function generadorCapMasaProblemas(ctx: GeneratorContext): GeneratorResult {
  const rng = createSeededRng(ctx.seed + ctx.sessionProblemIndex * 109 + 1);

  let text: string;
  let answer: number;
  let visualData: VisualData | undefined;

  switch (ctx.tier) {
    case 1: {
      // EASY: simple addition — capacity or mass, same unit system
      if (rng() > 0.5) {
        // Capacity problem: L + mL → total mL
        const litros = rngInt(rng, 1, 4);
        const ml = rngPick(rng, [250, 500, 750]);
        answer = litros * 1000 + ml;
        const liquido = rngPick(rng, COSAS_LIQUIDO);
        text = `Ana tiene ${litros} L y ${ml} mL de ${liquido}. ¿Cuántos mililitros tiene en total?`;
      } else {
        // Mass problem: kg + g → total g
        const kg = rngInt(rng, 1, 5);
        const g = rngPick(rng, [200, 500, 800]);
        answer = kg * 1000 + g;
        const comida = rngPick(rng, COSAS_SOLIDO);
        text = `Una bolsa tiene ${kg} kg y ${g} g de ${comida}. ¿Cuántos gramos pesa en total?`;
      }
      break;
    }
    case 2: {
      // MEDIUM: balance-scale comparison with visualData
      const item = rngPick(rng, ITEMS_BALANZA);
      const leftKg = rngInt(rng, 2, 7);
      const rightKg = rngInt(rng, 1, Math.max(leftKg - 1, 1));
      answer = leftKg - rightKg;

      visualData = {
        type: "balance",
        data: {
          leftLabel: `${leftKg} kg`,
          rightLabel: `${rightKg} kg`,
          leftValue: leftKg,
          rightValue: rightKg,
          item,
        },
      };

      text = `En el plato izquierdo de la balanza hay ${leftKg} kg de ${item}. En el derecho hay ${rightKg} kg. ¿Cuántos kilogramos más hay en el plato izquierdo?`;
      break;
    }
    default: {
      // HARD: multi-step word problems
      const modo = rng() > 0.5 ? "capacity" : "mass";
      if (modo === "capacity") {
        // Servir vasos de una jarra
        const litrosInicial = rngInt(rng, 1, 3);
        const mlInicial = rngPick(rng, [0, 250, 500]);
        const totalInicialMl = litrosInicial * 1000 + mlInicial;
        const vasos = rngInt(rng, 2, 4);
        const mlPorVaso = rngPick(rng, [150, 200, 250]);
        const totalServido = vasos * mlPorVaso;
        answer = totalInicialMl - totalServido;
        const liquido = rngPick(rng, COSAS_LIQUIDO);
        const inicialStr =
          mlInicial > 0
            ? `${litrosInicial} L y ${mlInicial} mL`
            : `${litrosInicial} L`;
        text = `Una jarra tiene ${inicialStr} de ${liquido}. Ana sirve ${vasos} vasos de ${mlPorVaso} mL cada uno. ¿Cuántos mL quedan en la jarra?`;
      } else {
        // Comprar varios paquetes
        const paquetes = rngInt(rng, 2, 4);
        const gPorPaquete = rngPick(rng, [250, 500, 1000]);
        answer = paquetes * gPorPaquete;
        const comida = rngPick(rng, COSAS_SOLIDO);
        text = `Ana compra ${paquetes} paquetes de ${comida} de ${gPorPaquete} g cada uno. ¿Cuántos gramos pesan en total?`;
      }
      break;
    }
  }

  const errors = [
    answer + 1,
    answer - 1,
    answer + 100,
    answer - 100,
    answer + 500,
    answer - 500,
  ];

  const options = generateDistractors(answer, 3, rng, errors);

  return {
    text,
    answer,
    type: "multiple-choice",
    options: rngShuffle(rng, [...options, answer]),
    ...(visualData ? { visualData } : {}),
  };
}

// ──────────────────────────────────────────────
// Registry Export
// ──────────────────────────────────────────────

export const capMassGenerators: Partial<
  Record<SubSkillId, ProblemGenerator>
> = {
  [SUB_SKILL_IDS.CAP_MASA_PROBLEMAS]: generadorCapMasaProblemas,
};
