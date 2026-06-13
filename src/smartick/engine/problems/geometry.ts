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
// Shape Definitions
// ──────────────────────────────────────────────

interface ShapeEntry {
  name: string;
  sides: number;
  vertices: number;
  axesSimetria: number;
}

const SHAPES_BASIC: ShapeEntry[] = [
  { name: "triángulo", sides: 3, vertices: 3, axesSimetria: 3 },
  { name: "cuadrado", sides: 4, vertices: 4, axesSimetria: 4 },
  { name: "rectángulo", sides: 4, vertices: 4, axesSimetria: 2 },
];

const SHAPES_MEDIUM: ShapeEntry[] = [
  { name: "pentágono", sides: 5, vertices: 5, axesSimetria: 5 },
  { name: "hexágono", sides: 6, vertices: 6, axesSimetria: 6 },
  { name: "octágono", sides: 8, vertices: 8, axesSimetria: 8 },
];

const SHAPES_HARD: ShapeEntry[] = [
  { name: "rombo", sides: 4, vertices: 4, axesSimetria: 2 },
  { name: "trapecio", sides: 4, vertices: 4, axesSimetria: 1 },
  { name: "paralelogramo", sides: 4, vertices: 4, axesSimetria: 0 },
];

// ──────────────────────────────────────────────
// Skill-08-01: Clasificación de figuras
// ──────────────────────────────────────────────

function generadorFigClasificacion(ctx: GeneratorContext): GeneratorResult {
  const rng = createSeededRng(ctx.seed + ctx.sessionProblemIndex * 59 + 1);

  let shapes: ShapeEntry[];
  switch (ctx.tier) {
    case 1:
      shapes = SHAPES_BASIC;
      break;
    case 2:
      shapes = SHAPES_MEDIUM;
      break;
    default:
      shapes = SHAPES_HARD;
      break;
  }

  const shape = rngPick(rng, shapes);

  // Rotación de formatos de preguntas
  const preguntas = [
    `¿Cuántos lados tiene un ${shape.name}?`,
    `¿Cuántos vértices tiene un ${shape.name}?`,
  ];
  // Para HARD añadimos preguntas sobre simetría / pares paralelos
  const allPreguntas =
    ctx.tier >= 3
      ? [
          ...preguntas,
          `¿Cuántos pares de lados paralelos tiene un ${shape.name}?`,
        ]
      : preguntas;

  const index = ctx.sessionProblemIndex % allPreguntas.length;
  const text = allPreguntas[index];

  let answer: number;
  switch (index) {
    case 0:
      answer = shape.sides;
      break;
    case 1:
      answer = shape.vertices;
      break;
    default:
      // Pares de lados paralelos según figura
      answer = getParallelPairs(shape.name);
      break;
  }

  const errors = [
    answer + 1,
    answer - 1,
    answer + 2,
    shape.vertices + shape.sides,
  ];

  const options = generateDistractors(answer, 3, rng, errors);

  return {
    text,
    answer,
    type: "multiple-choice",
    options: rngShuffle(rng, [...options, answer]),
  };
}

function getParallelPairs(name: string): number {
  switch (name) {
    case "cuadrado":
    case "rectángulo":
    case "rombo":
    case "paralelogramo":
      return 2;
    case "trapecio":
      return 1;
    case "triángulo":
    case "pentágono":
    case "hexágono":
    case "octágono":
    default:
      return 0;
  }
}

// ──────────────────────────────────────────────
// Skill-08-02: Perímetro
// ──────────────────────────────────────────────

interface FigPerim {
  nombre: string;
  lados: number;
}

const FIGURAS_REGULARES: FigPerim[] = [
  { nombre: "cuadrado", lados: 4 },
  { nombre: "triángulo equilátero", lados: 3 },
  { nombre: "pentágono regular", lados: 5 },
  { nombre: "hexágono regular", lados: 6 },
  { nombre: "octágono regular", lados: 8 },
];

function generadorFigPerimetro(ctx: GeneratorContext): GeneratorResult {
  const rng = createSeededRng(ctx.seed + ctx.sessionProblemIndex * 61 + 1);

  let text: string;
  let answer: number;

  switch (ctx.tier) {
    case 1: {
      // EASY: figuras regulares, lado × número de lados
      const fig = rngPick(rng, FIGURAS_REGULARES);
      const lado = rngPick(rng, [3, 4, 5, 6, 7, 8, 10]);
      answer = lado * fig.lados;
      text = `¿Cuál es el perímetro de un ${fig.nombre} de lado ${lado} cm?`;
      break;
    }
    case 2: {
      // MEDIUM: rectángulo (irregular simple)
      const base = rngInt(rng, 4, 12);
      const altura = rngInt(rng, 2, 8);
      answer = 2 * (base + altura);
      text = `Un rectángulo mide ${base} cm de largo y ${altura} cm de ancho. ¿Cuál es su perímetro?`;
      break;
    }
    default: {
      // HARD: calcular lado faltante desde perímetro conocido
      const fig = rngPick(rng, FIGURAS_REGULARES.filter((f) => f.lados >= 3));
      const lado = rngInt(rng, 4, 10);
      const perimetro = lado * fig.lados;
      answer = lado;
      text = `El perímetro de un ${fig.nombre} es ${perimetro} cm. ¿Cuánto mide cada lado?`;
      break;
    }
  }

  const errors = [
    answer + 1,
    answer - 1,
    answer * 2,
    Math.floor(answer / 2),
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
// Skill-08-03: Simetría
// ──────────────────────────────────────────────

interface SimetriaEntry {
  nombre: string;
  ejes: number;
}

const FIGURAS_SIMETRIA_EASY: SimetriaEntry[] = [
  { nombre: "cuadrado", ejes: 4 },
  { nombre: "rectángulo", ejes: 2 },
  { nombre: "triángulo equilátero", ejes: 3 },
  { nombre: "círculo", ejes: 999 }, // infinitos — usamos 999 como marcador
];

const FIGURAS_SIMETRIA_MEDIUM: SimetriaEntry[] = [
  { nombre: "pentágono regular", ejes: 5 },
  { nombre: "hexágono regular", ejes: 6 },
  { nombre: "octágono regular", ejes: 8 },
  { nombre: "rombo", ejes: 2 },
];

const FIGURAS_SIMETRIA_HARD: SimetriaEntry[] = [
  { nombre: "trapecio isósceles", ejes: 1 },
  { nombre: "paralelogramo", ejes: 0 },
  { nombre: "triángulo isósceles", ejes: 1 },
  { nombre: "triángulo escaleno", ejes: 0 },
];

function generadorFigSimetria(ctx: GeneratorContext): GeneratorResult {
  const rng = createSeededRng(ctx.seed + ctx.sessionProblemIndex * 67 + 1);

  let figuras: SimetriaEntry[];
  switch (ctx.tier) {
    case 1:
      figuras = FIGURAS_SIMETRIA_EASY;
      break;
    case 2:
      figuras = FIGURAS_SIMETRIA_MEDIUM;
      break;
    default:
      figuras = FIGURAS_SIMETRIA_HARD;
      break;
  }

  const fig = rngPick(rng, figuras);

  // Para el círculo (ejes infinitos), hacemos una pregunta especial
  if (fig.ejes === 999) {
    const text = "¿Cuántos ejes de simetría tiene un círculo?";
    const answer = 999; // marcador
    // Opciones especiales para el círculo
    return {
      text,
      answer: 0, // "infinitos" pero representamos como 0
      type: "multiple-choice",
      options: rngShuffle(rng, [0, 1, 2, 4]),
    };
  }

  const text = `¿Cuántos ejes de simetría tiene un ${fig.nombre}?`;

  const errors = [
    fig.ejes + 1,
    fig.ejes - 1 >= 0 ? fig.ejes - 1 : 0,
    fig.ejes + 2,
  ];

  const options = generateDistractors(fig.ejes, 3, rng, errors);

  return {
    text,
    answer: fig.ejes,
    type: "multiple-choice",
    options: rngShuffle(rng, [...options, fig.ejes]),
  };
}

// ──────────────────────────────────────────────
// Registry Export
// ──────────────────────────────────────────────

export const geometryGenerators: Partial<
  Record<SubSkillId, ProblemGenerator>
> = {
  [SUB_SKILL_IDS.FIG_CLASIFICACION]: generadorFigClasificacion,
  [SUB_SKILL_IDS.FIG_PERIMETRO]: generadorFigPerimetro,
  [SUB_SKILL_IDS.FIG_SIMETRIA]: generadorFigSimetria,
};
