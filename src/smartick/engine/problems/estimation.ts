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
// Skill-09-03: Estimación y medición
// ──────────────────────────────────────────────

interface Objeto {
  nombre: string;
  medidaCm: number;
}

const OBJETOS_PEQUENIOS: Objeto[] = [
  { nombre: "un lápiz", medidaCm: 15 },
  { nombre: "una regla escolar", medidaCm: 30 },
  { nombre: "un borrador", medidaCm: 5 },
  { nombre: "un cuaderno", medidaCm: 25 },
  { nombre: "un celular", medidaCm: 14 },
  { nombre: "un crayón", medidaCm: 10 },
  { nombre: "un tenedor", medidaCm: 18 },
  { nombre: "un clip", medidaCm: 3 },
  { nombre: "una goma de borrar", medidaCm: 4 },
  { nombre: "un marcador", medidaCm: 12 },
];

const OBJETOS_GRANDES: Objeto[] = [
  { nombre: "una mesa de comedor", medidaCm: 200 },
  { nombre: "una silla", medidaCm: 80 },
  { nombre: "una puerta", medidaCm: 200 },
  { nombre: "un pizarrón", medidaCm: 150 },
  { nombre: "una cama", medidaCm: 190 },
  { nombre: "un refrigerador", medidaCm: 170 },
  { nombre: "una ventana", medidaCm: 100 },
  { nombre: "un escritorio", medidaCm: 120 },
];

interface EstimacionReferencia {
  pregunta: string;
  respuesta: number;
}

const ESTIMACION_REFERENCIA: EstimacionReferencia[] = [
  {
    pregunta:
      "Un crayón mide 10 cm. ¿Aproximadamente cuántos crayones necesitas para cubrir 1 metro?",
    respuesta: 10,
  },
  {
    pregunta:
      "Un cuaderno mide 25 cm. ¿Aproximadamente cuántos cuadernos necesitas para cubrir 2 metros?",
    respuesta: 8,
  },
  {
    pregunta:
      "Un paso de Ana mide 50 cm. ¿Cuántos pasos necesita para cruzar un pasillo de 5 metros?",
    respuesta: 10,
  },
  {
    pregunta:
      "Una regla mide 30 cm. ¿Aproximadamente cuántas reglas necesitas para medir 3 metros?",
    respuesta: 10,
  },
  {
    pregunta:
      "La mano de Ana mide 10 cm. ¿Cuántas manos necesita para medir el ancho de una mesa de 80 cm?",
    respuesta: 8,
  },
  {
    pregunta:
      "Un libro mide 20 cm. ¿Aproximadamente cuántos libros necesitas para cubrir 1 metro?",
    respuesta: 5,
  },
  {
    pregunta:
      "Un lápiz mide 15 cm. ¿Aproximadamente cuántos lápices necesitas para cubrir 60 cm?",
    respuesta: 4,
  },
  {
    pregunta:
      "Una moneda mide 2 cm de ancho. ¿Cuántas monedas necesitas para cubrir 20 cm?",
    respuesta: 10,
  },
];

function generadorEstimacion(ctx: GeneratorContext): GeneratorResult {
  const rng = createSeededRng(ctx.seed + ctx.sessionProblemIndex * 107 + 1);

  let text: string;
  let answer: number;

  switch (ctx.tier) {
    case 1: {
      // EASY: estimate length of small common objects in cm
      const obj = rngPick(rng, OBJETOS_PEQUENIOS);
      answer = obj.medidaCm;
      text = `¿Cuántos centímetros mide aproximadamente ${obj.nombre}?`;
      break;
    }
    case 2: {
      // MEDIUM: estimate length of larger objects in cm
      const obj = rngPick(rng, OBJETOS_GRANDES);
      answer = obj.medidaCm;
      text = `¿Cuántos centímetros mide aproximadamente ${obj.nombre}?`;
      break;
    }
    default: {
      // HARD: reference estimation — how many units fit in a length
      const ref = rngPick(rng, ESTIMACION_REFERENCIA);
      answer = ref.respuesta;
      text = ref.pregunta;
      break;
    }
  }

  const errors = [
    answer + 1,
    answer - 1,
    answer * 2,
    Math.round(answer / 2),
    answer + 10,
    answer - 10,
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

export const estimationGenerators: Partial<
  Record<SubSkillId, ProblemGenerator>
> = {
  [SUB_SKILL_IDS.LONG_ESTIMACION]: generadorEstimacion,
};
