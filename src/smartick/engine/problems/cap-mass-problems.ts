import type {
  GeneratorContext,
  GeneratorResult,
  ProblemGenerator,
  SubSkillId,
  VisualData,
} from "../types";
import type { FillScene, ScaleScene } from "../scenes/types";
import type { VisualProblemData } from "../scenes/types";
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

/** Split "Setup. ¿Question?" into story + question parts. */
function splitText(text: string): { story: string; question: string } {
  const idx = text.indexOf(" ¿");
  if (idx === -1) return { story: text, question: text };
  return {
    story: text.slice(0, idx),
    question: text.slice(idx + 1),
  };
}

function generadorCapMasaProblemas(ctx: GeneratorContext): GeneratorResult {
  const rng = createSeededRng(ctx.seed + ctx.sessionProblemIndex * 109 + 1);

  let text: string;
  let answer: number;
  let visualData: VisualData | undefined;
  let sceneData: VisualProblemData | undefined;

  switch (ctx.tier) {
    case 1: {
      // EASY: simple addition — capacity or mass, same unit system
      if (rng() > 0.5) {
        // Capacity problem: L + mL → total mL — FillScene
        const litros = rngInt(rng, 1, 4);
        const ml = rngPick(rng, [250, 500, 750]);
        answer = litros * 1000 + ml;
        const liquido = rngPick(rng, COSAS_LIQUIDO);
        text = `Ana tiene ${litros} L y ${ml} mL de ${liquido}. ¿Cuántos mililitros tiene en total?`;

        const { story, question } = splitText(text);
        const fillScene: FillScene = {
          type: "fill",
          containerLabel: "botella",
          totalCapacity: Math.max(answer, 200),
          currentFill: answer,
          unit: "ml",
          icon: "water",
        };
        const errors = [answer + 1, answer - 1, answer + 100, answer - 100, answer + 500, answer - 500];
        const options = generateDistractors(answer, 3, rng, errors);
        sceneData = {
          scene: fillScene,
          story,
          question,
          narration: `${story} ${question}`,
          answer,
          options: [...options, answer],
        };
      } else {
        // Mass problem: kg + g → total g — ScaleScene
        const kg = rngInt(rng, 1, 5);
        const g = rngPick(rng, [200, 500, 800]);
        answer = kg * 1000 + g;
        const comida = rngPick(rng, COSAS_SOLIDO);
        text = `Una bolsa tiene ${kg} kg y ${g} g de ${comida}. ¿Cuántos gramos pesa en total?`;

        const { story, question } = splitText(text);
        const massScene: ScaleScene = {
          type: "scale",
          leftItems: kg,
          rightItems: Math.max(Math.round(g / 250), 1),
          icon: "cookie",
          itemLabel: "kg",
        };
        const errors = [answer + 1, answer - 1, answer + 100, answer - 100, answer + 500, answer - 500];
        const options = generateDistractors(answer, 3, rng, errors);
        sceneData = {
          scene: massScene,
          story,
          question,
          narration: `${story} ${question}`,
          answer,
          options: [...options, answer],
        };
      }
      break;
    }
    case 2: {
      // MEDIUM: balance-scale comparison — ScaleScene
      const item = rngPick(rng, ITEMS_BALANZA);
      const leftKg = rngInt(rng, 2, 7);
      const rightKg = rngInt(rng, 1, Math.max(leftKg - 1, 1));
      answer = leftKg - rightKg;

      text = `En el plato izquierdo de la balanza hay ${leftKg} kg de ${item}. En el derecho hay ${rightKg} kg. ¿Cuántos kilogramos más hay en el plato izquierdo?`;

      const { story, question } = splitText(text);
      const scaleScene: ScaleScene = {
        type: "scale",
        leftItems: leftKg,
        rightItems: rightKg,
        icon: "ball",
        itemLabel: item,
      };
      const errors = [answer + 1, answer - 1, Math.abs(leftKg - rightKg) + 1, Math.min(leftKg, rightKg)];
      const options = generateDistractors(answer, 3, rng, errors);
      sceneData = {
        scene: scaleScene,
        story,
        question,
        narration: `${story} ${question}`,
        answer,
        options: [...options, answer],
      };
      break;
    }
    default: {
      // HARD: multi-step word problems — skip scene for now
      const modo = rng() > 0.5 ? "capacity" : "mass";
      if (modo === "capacity") {
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
    ...(sceneData ? { sceneData } : {}),
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
