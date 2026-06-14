import type {
  GeneratorContext,
  GeneratorResult,
  ProblemGenerator,
  SubSkillId,
} from "../types";
import type { GeometryShapeScene } from "../scenes/types";
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
// Shape Definitions
// ──────────────────────────────────────────────

interface ShapeEntry {
  name: string;
  sides: number;
  vertices: number;
  axesSimetria: number;
}

/** Mapping from Spanish shape names to GeometryShapeScene shape keys + color. */
const SHAPE_SCENE_MAP: Record<string, { shape: GeometryShapeScene["shape"]; color: string } | undefined> = {
  triángulo: { shape: "triangle", color: "#FF6B35" },
  cuadrado: { shape: "square", color: "#00B894" },
  rectángulo: { shape: "rectangle", color: "#74B9FF" },
  pentágono: { shape: "pentagon", color: "#A29BFE" },
  hexágono: { shape: "hexagon", color: "#FF7675" },
};

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

  // GeometryShapeScene for supported shapes (tier 1–2 only, shape mapping exists)
  const sceneMapping = SHAPE_SCENE_MAP[shape.name];
  const sceneData: VisualProblemData | undefined =
    sceneMapping && ctx.tier <= 2
      ? {
          scene: {
            type: "geometry-shape",
            shape: sceneMapping.shape,
            count: index === 0 ? shape.sides : shape.vertices,
            color: sceneMapping.color,
          },
          story: text,
          question: text,
          narration: text,
          answer,
          options: [...options, answer],
        }
      : undefined;

  return {
    text,
    answer,
    type: "multiple-choice",
    options: rngShuffle(rng, [...options, answer]),
    sceneData,
    visualData: {
      type: "shape",
      data: {
        shapeName: shape.name,
        sides: shape.sides,
        showLabels: true,
      },
    },
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

/**
 * Map a shape name (as used in SimetriaEntry) to its number of sides.
 */
function getSidesFromName(nombre: string): number {
  const map: Record<string, number> = {
    triángulo: 3,
    "triángulo equilátero": 3,
    "triángulo isósceles": 3,
    "triángulo escaleno": 3,
    cuadrado: 4,
    rectángulo: 4,
    rombo: 4,
    trapecio: 4,
    "trapecio isósceles": 4,
    paralelogramo: 4,
    pentágono: 5,
    "pentágono regular": 5,
    hexágono: 6,
    "hexágono regular": 6,
    octágono: 8,
    "octágono regular": 8,
    círculo: 0,
  };
  return map[nombre] ?? 0;
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
      visualData: {
        type: "shape",
        data: {
          shapeName: "círculo",
          sides: 0,
          showLabels: false,
          highlightProperty: "symmetry",
        },
      },
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
    visualData: {
      type: "shape",
      data: {
        shapeName: fig.nombre,
        sides: getSidesFromName(fig.nombre),
        showLabels: false,
        highlightProperty: "symmetry",
      },
    },
  };
}

// ──────────────────────────────────────────────
// Solid Geometry Definitions
// ──────────────────────────────────────────────

interface SolidEntry {
  solidName: string;
  vertices: number;
  edges: number;
  faces: number;
  tipo: "prisma" | "pirámide" | "cilindro" | "cono" | "esfera";
}

const PRISMAS: SolidEntry[] = [
  { solidName: "prisma triangular", vertices: 6, edges: 9, faces: 5, tipo: "prisma" },
  { solidName: "cubo", vertices: 8, edges: 12, faces: 6, tipo: "prisma" },
  { solidName: "prisma rectangular", vertices: 8, edges: 12, faces: 6, tipo: "prisma" },
  { solidName: "prisma pentagonal", vertices: 10, edges: 15, faces: 7, tipo: "prisma" },
  { solidName: "prisma hexagonal", vertices: 12, edges: 18, faces: 8, tipo: "prisma" },
];

const PIRAMIDES: SolidEntry[] = [
  { solidName: "pirámide triangular", vertices: 4, edges: 6, faces: 4, tipo: "pirámide" },
  { solidName: "pirámide cuadrangular", vertices: 5, edges: 8, faces: 5, tipo: "pirámide" },
  { solidName: "pirámide pentagonal", vertices: 6, edges: 10, faces: 6, tipo: "pirámide" },
  { solidName: "pirámide hexagonal", vertices: 7, edges: 12, faces: 7, tipo: "pirámide" },
];

const CUERPOS_REDONDOS: SolidEntry[] = [
  { solidName: "cilindro", vertices: 0, edges: 2, faces: 3, tipo: "cilindro" },
  { solidName: "cono", vertices: 1, edges: 1, faces: 2, tipo: "cono" },
  { solidName: "esfera", vertices: 0, edges: 0, faces: 1, tipo: "esfera" },
];

const ALL_SOLIDS: SolidEntry[] = [...PRISMAS, ...PIRAMIDES, ...CUERPOS_REDONDOS];

// ──────────────────────────────────────────────
// Skill-12-01: Prismas y pirámides
// ──────────────────────────────────────────────

function generadorPrismasPiramides(ctx: GeneratorContext): GeneratorResult {
  const rng = createSeededRng(ctx.seed + ctx.sessionProblemIndex * 113 + 1);

  let text: string;
  let answer: number;
  let solid: SolidEntry;

  switch (ctx.tier) {
    case 1: {
      // EASY: basic prisms and pyramids — count faces, vertices, edges
      solid = rngPick(rng, [PRISMAS[0], PRISMAS[1], PIRAMIDES[0], PIRAMIDES[1]]);
      const preguntas = [
        `¿Cuántas caras tiene un ${solid.solidName}?`,
        `¿Cuántos vértices tiene un ${solid.solidName}?`,
        `¿Cuántas aristas tiene un ${solid.solidName}?`,
      ];
      const qIdx = ctx.sessionProblemIndex % 3;
      text = preguntas[qIdx];
      answer = qIdx === 0 ? solid.faces : qIdx === 1 ? solid.vertices : solid.edges;
      break;
    }
    case 2: {
      // MEDIUM: pentagonal / hexagonal prisms and pyramids
      solid = rngPick(rng, [PRISMAS[3], PRISMAS[4], PIRAMIDES[2], PIRAMIDES[3]]);
      const qIdx = ctx.sessionProblemIndex % 2;
      const preguntas = [
        `¿Cuántas caras tiene un ${solid.solidName}?`,
        `¿Cuántas aristas tiene un ${solid.solidName}?`,
      ];
      text = preguntas[qIdx];
      answer = qIdx === 0 ? solid.faces : solid.edges;
      break;
    }
    default: {
      // HARD: compare a prism vs a pyramid
      const prisma = rngPick(rng, PRISMAS);
      const piramide = rngPick(rng, PIRAMIDES);
      answer = Math.abs(prisma.edges - piramide.edges);
      text = `¿Cuántas aristas más tiene un ${prisma.solidName} que una ${piramide.solidName}?`;
      solid = prisma;
      break;
    }
  }

  const errors = [answer + 1, answer - 1, answer + 2, answer - 2];
  const options = generateDistractors(answer, 3, rng, errors);

  return {
    text,
    answer,
    type: "multiple-choice",
    options: rngShuffle(rng, [...options, answer]),
    visualData: {
      type: "solid",
      data: {
        solidName: solid.solidName,
        vertices: solid.vertices,
        edges: solid.edges,
        faces: solid.faces,
      },
    },
  };
}

// ──────────────────────────────────────────────
// Skill-12-02: Cilindros, conos, esferas
// ──────────────────────────────────────────────

function generadorCilindrosConosEsferas(ctx: GeneratorContext): GeneratorResult {
  const rng = createSeededRng(ctx.seed + ctx.sessionProblemIndex * 127 + 1);

  let text: string;
  let answer: number;
  let solid: SolidEntry;

  switch (ctx.tier) {
    case 1: {
      // EASY: identify cylinders, cones, spheres by description
      solid = rngPick(rng, CUERPOS_REDONDOS);
      const preguntas = [
        `¿Cuántas caras tiene un ${solid.solidName}?`,
        `¿Cuántas aristas tiene un ${solid.solidName}?`,
        `¿Cuántos vértices tiene un ${solid.solidName}?`,
      ];
      const qIdx = ctx.sessionProblemIndex % 3;
      text = preguntas[qIdx];
      answer = qIdx === 0 ? solid.faces : qIdx === 1 ? solid.edges : solid.vertices;
      break;
    }
    case 2: {
      // MEDIUM: compare a redondo solid against a prism/pyramid
      const redondo = rngPick(rng, CUERPOS_REDONDOS);
      const solido = rngPick(rng, ALL_SOLIDS.filter((s) => s.tipo !== redondo.tipo));

      if (rng() > 0.5) {
        text = `¿Cuántas caras tiene un ${redondo.solidName}?`;
        answer = redondo.faces;
        solid = redondo;
      } else {
        text = `¿Cuántos vértices tiene un ${redondo.solidName}?`;
        answer = redondo.vertices;
        solid = redondo;
      }
      break;
    }
    default: {
      // HARD: count edges of curved solids
      solid = rngPick(rng, CUERPOS_REDONDOS);
      text = `¿Cuántas aristas tiene un ${solid.solidName}?`;
      answer = solid.edges;
      break;
    }
  }

  const errors = [answer + 1, answer - 1, answer + 2, answer > 0 ? answer - 2 : 2];
  const options = generateDistractors(answer, 3, rng, errors);

  return {
    text,
    answer,
    type: "multiple-choice",
    options: rngShuffle(rng, [...options, answer]),
    visualData: {
      type: "solid",
      data: {
        solidName: solid.solidName,
        vertices: solid.vertices,
        edges: solid.edges,
        faces: solid.faces,
      },
    },
  };
}

// ──────────────────────────────────────────────
// Skill-12-03: Aristas, vértices, caras
// ──────────────────────────────────────────────

function generadorAristasVertices(ctx: GeneratorContext): GeneratorResult {
  const rng = createSeededRng(ctx.seed + ctx.sessionProblemIndex * 131 + 1);

  let text: string;
  let answer: number;
  let solid: SolidEntry;

  switch (ctx.tier) {
    case 1: {
      // EASY: well-known solids — cube, triangular prism, square pyramid
      solid = rngPick(rng, [PRISMAS[1], PRISMAS[0], PIRAMIDES[1]]);
      const preguntas = [
        `¿Cuántos vértices tiene un ${solid.solidName}?`,
        `¿Cuántas aristas tiene un ${solid.solidName}?`,
        `¿Cuántas caras tiene un ${solid.solidName}?`,
      ];
      const qIdx = ctx.sessionProblemIndex % 3;
      text = preguntas[qIdx];
      answer = qIdx === 0 ? solid.vertices : qIdx === 1 ? solid.edges : solid.faces;
      break;
    }
    case 2: {
      // MEDIUM: any prism or pyramid
      solid = rngPick(rng, [...PRISMAS, ...PIRAMIDES]);
      const qIdx = ctx.sessionProblemIndex % 3;
      const preguntas = [
        `¿Cuántas aristas tiene un ${solid.solidName}?`,
        `¿Cuántos vértices tiene un ${solid.solidName}?`,
        `¿Cuántas caras tiene un ${solid.solidName}?`,
      ];
      text = preguntas[qIdx];
      answer = qIdx === 0 ? solid.edges : qIdx === 1 ? solid.vertices : solid.faces;
      break;
    }
    default: {
      // HARD: find the relationship (Euler's formula for 3rd grade level)
      // Ask: vertices + faces - edges = ?
      solid = rngPick(rng, [...PRISMAS, ...PIRAMIDES]);
      const relacion = solid.vertices + solid.faces - solid.edges;
      const preguntas = [
        `Un ${solid.solidName} tiene ${solid.vertices} vértices, ${solid.faces} caras y ${solid.edges} aristas. ¿Cuánto es vértices + caras - aristas?`,
        `Si un ${solid.solidName} tiene ${solid.vertices} vértices y ${solid.faces} caras, ¿cuánto suman?`,
      ];
      text = rngPick(rng, preguntas);
      answer = preguntas.indexOf(text) === 0 ? relacion : solid.vertices + solid.faces;
      break;
    }
  }

  const errors = [answer + 1, answer - 1, answer + 2];
  const options = generateDistractors(answer, 3, rng, errors);

  return {
    text,
    answer,
    type: "multiple-choice",
    options: rngShuffle(rng, [...options, answer]),
    visualData: {
      type: "solid",
      data: {
        solidName: solid.solidName,
        vertices: solid.vertices,
        edges: solid.edges,
        faces: solid.faces,
      },
    },
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
  [SUB_SKILL_IDS.CUERPOS_PRISMAS_PIRAMIDES]: generadorPrismasPiramides,
  [SUB_SKILL_IDS.CUERPOS_CILINDROS_CONOS_ESFERAS]: generadorCilindrosConosEsferas,
  [SUB_SKILL_IDS.CUERPOS_ARISTAS_VERTICES]: generadorAristasVertices,
};
