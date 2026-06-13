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
// Skill-09-01: m, cm, mm (longitud)
// ──────────────────────────────────────────────

function generadorLongitud(ctx: GeneratorContext): GeneratorResult {
  const rng = createSeededRng(ctx.seed + ctx.sessionProblemIndex * 71 + 1);

  let text: string;
  let answer: number;

  switch (ctx.tier) {
    case 1: {
      // EASY: ¿cuál es más largo? — preguntamos cuantos cm son X m
      const metros = rngInt(rng, 2, 9);
      answer = metros * 100;
      text = `¿Cuántos centímetros son ${metros} metros?`;
      break;
    }
    case 2: {
      // MEDIUM: convertir m ↔ cm
      const modo = rng() > 0.5 ? "m-a-cm" : "cm-a-m";
      if (modo === "m-a-cm") {
        const metros = rngInt(rng, 2, 12);
        answer = metros * 100;
        text = `¿Cuántos centímetros son ${metros} metros?`;
      } else {
        const cm = rngPick(rng, [200, 300, 400, 500, 600, 700, 800, 900]);
        answer = cm / 100;
        text = `¿Cuántos metros son ${cm} centímetros?`;
      }
      break;
    }
    default: {
      // HARD: convertir cm ↔ mm y ordenar
      const modo = rng() > 0.5 ? "cm-a-mm" : "mm-a-cm";
      if (modo === "cm-a-mm") {
        const cm = rngInt(rng, 2, 15);
        answer = cm * 10;
        text = `¿Cuántos milímetros son ${cm} centímetros?`;
      } else {
        const mm = rngPick(rng, [50, 80, 120, 150, 200, 300]);
        answer = mm / 10;
        text = `¿Cuántos centímetros son ${mm} milímetros?`;
      }
      break;
    }
  }

  const errors = [
    answer + 1,
    answer - 1,
    answer * 10,
    Math.round(answer / 10),
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
// Skill-10-01: l, ml (capacidad)
// ──────────────────────────────────────────────

function generadorCapacidad(ctx: GeneratorContext): GeneratorResult {
  const rng = createSeededRng(ctx.seed + ctx.sessionProblemIndex * 73 + 1);

  let text: string;
  let answer: number;

  switch (ctx.tier) {
    case 1: {
      // EASY: lectura directa, L → ml
      const litros = rngInt(rng, 1, 5);
      answer = litros * 1000;
      text = `¿Cuántos mililitros son ${litros} litro${litros > 1 ? "s" : ""}?`;
      break;
    }
    case 2: {
      // MEDIUM: convertir ml → L
      const modo = rng() > 0.5 ? "l-a-ml" : "ml-a-l";
      if (modo === "l-a-ml") {
        const litros = rngInt(rng, 2, 8);
        answer = litros * 1000;
        text = `¿Cuántos mililitros hay en ${litros} litros?`;
      } else {
        const ml = rngPick(rng, [1000, 2000, 3000, 4000, 5000, 7000]);
        answer = ml / 1000;
        text = `¿Cuántos litros son ${ml} mililitros?`;
      }
      break;
    }
    default: {
      // HARD: comparar / ordenar capacidades
      const litros = rngInt(rng, 1, 4);
      const mlAdicional = rngPick(rng, [250, 500, 750]);
      answer = litros * 1000 + mlAdicional;
      text = `Ana tiene ${litros} L y ${mlAdicional} ml de agua. ¿Cuántos mililitros tiene en total?`;
      break;
    }
  }

  const errors = [
    answer + 1,
    answer - 1,
    answer + 100,
    answer - 100,
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
// Skill-10-02: g, kg (masa)
// ──────────────────────────────────────────────

function generadorMasa(ctx: GeneratorContext): GeneratorResult {
  const rng = createSeededRng(ctx.seed + ctx.sessionProblemIndex * 79 + 1);

  let text: string;
  let answer: number;

  switch (ctx.tier) {
    case 1: {
      // EASY: kg → g directo
      const kg = rngInt(rng, 1, 5);
      answer = kg * 1000;
      text = `¿Cuántos gramos son ${kg} kilogramo${kg > 1 ? "s" : ""}?`;
      break;
    }
    case 2: {
      // MEDIUM: g → kg
      const modo = rng() > 0.5 ? "kg-a-g" : "g-a-kg";
      if (modo === "kg-a-g") {
        const kg = rngInt(rng, 2, 7);
        answer = kg * 1000;
        text = `¿Cuántos gramos son ${kg} kilogramos?`;
      } else {
        const g = rngPick(rng, [2000, 3000, 4000, 5000, 6000]);
        answer = g / 1000;
        text = `¿Cuántos kilogramos son ${g} gramos?`;
      }
      break;
    }
    default: {
      // HARD: problemas con masa
      const kg = rngInt(rng, 2, 5);
      const gAdicional = rngPick(rng, [200, 500, 800]);
      answer = kg * 1000 + gAdicional;
      text = `Una bolsa pesa ${kg} kg y ${gAdicional} g. ¿Cuántos gramos pesa en total?`;
      break;
    }
  }

  const errors = [
    answer + 1,
    answer - 1,
    answer + 500,
    answer - 500,
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
// Skill-10-03: Conversiones mixtas
// ──────────────────────────────────────────────

function generadorConvMixtas(ctx: GeneratorContext): GeneratorResult {
  const rng = createSeededRng(ctx.seed + ctx.sessionProblemIndex * 83 + 1);

  let text: string;
  let answer: number;

  // Elegir tipo de conversión mixta
  const tipos = ["longitud", "capacidad", "masa"];
  const tipo = ctx.sessionProblemIndex % 3;

  switch (ctx.tier) {
    case 1: {
      // EASY: conversiones inversas directas
      switch (tipo) {
        case 0: {
          const cm = rngPick(rng, [100, 200, 500, 1000]);
          answer = cm / 100;
          text = `¿Cuántos metros son ${cm} centímetros?`;
          break;
        }
        case 1: {
          const ml = rngPick(rng, [1000, 2000, 4000, 6000]);
          answer = ml / 1000;
          text = `¿Cuántos litros son ${ml} mililitros?`;
          break;
        }
        default: {
          const g = rngPick(rng, [1000, 3000, 5000, 8000]);
          answer = g / 1000;
          text = `¿Cuántos kilogramos son ${g} gramos?`;
          break;
        }
      }
      break;
    }
    case 2: {
      // MEDIUM: números que no son redondos
      switch (tipo) {
        case 0: {
          const m = rngInt(rng, 2, 6);
          const cm = rngInt(rng, 1, 9) * 10;
          answer = m * 100 + cm;
          text = `¿Cuántos centímetros son ${m} m ${cm} cm?`;
          break;
        }
        case 1: {
          const l = rngInt(rng, 1, 4);
          const ml = rngPick(rng, [250, 500, 750]);
          answer = l * 1000 + ml;
          text = `¿Cuántos mililitros son ${l} L ${ml > 0 ? `y ${ml} ml` : ""}?`;
          break;
        }
        default: {
          const kg = rngInt(rng, 1, 5);
          const g = rngPick(rng, [250, 500, 750]);
          answer = kg * 1000 + g;
          text = `¿Cuántos gramos son ${kg} kg ${g > 0 ? `y ${g} g` : ""}?`;
          break;
        }
      }
      break;
    }
    default: {
      // HARD: ordenar / comparar entre unidades
      switch (tipo) {
        case 0: {
          const m = rngInt(rng, 1, 3);
          const cm = rngInt(rng, 1, 9) * 5;
          const totalCm = m * 100 + cm;
          const mm = totalCm * 10;
          answer = mm;
          text = `Una cuerda mide ${m} m ${cm} cm. ¿Cuántos milímetros son?`;
          break;
        }
        case 1: {
          const l = rngInt(rng, 1, 3);
          const ml = rngPick(rng, [100, 250, 500]);
          answer = l * 1000 + ml;
          text = `Una jarra tiene ${l} litro${l > 1 ? "s" : ""} y ${ml} ml. ¿Cuántos mililitros tiene?`;
          break;
        }
        default: {
          const kg = rngInt(rng, 1, 3);
          const g = rngPick(rng, [100, 400, 700]);
          answer = kg * 1000 + g;
          text = `Un paquete pesa ${kg} kg y ${g} g. ¿Cuántos gramos pesa?`;
          break;
        }
      }
      break;
    }
  }

  const errors = [
    answer + 1,
    answer - 1,
    answer + 100,
    answer - 100,
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

export const measurementGenerators: Partial<
  Record<SubSkillId, ProblemGenerator>
> = {
  [SUB_SKILL_IDS.LONG_M_CM_MM]: generadorLongitud,
  [SUB_SKILL_IDS.CAP_L_ML]: generadorCapacidad,
  [SUB_SKILL_IDS.MASA_G_KG]: generadorMasa,
  [SUB_SKILL_IDS.CAP_MASA_CONVERSIONES]: generadorConvMixtas,
};
