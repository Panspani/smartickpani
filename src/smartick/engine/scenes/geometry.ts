/**
 * Visual geometry scene generator.
 *
 * Generates visual geometry problems with SVG shape scenes.
 * Uses inline SVG for shape recognition, perimeter, symmetry.
 *
 * @module engine/scenes/geometry
 */

import type { VisualProblemData } from "./types";
import { createSeededRng, rngPick, generateDistractors } from "../problems/templates";

// Simple scene types for geometry (not using the complex scene unions)
export interface ShapeScene {
  type: "geometry-shape";
  shape: "triangle" | "square" | "rectangle" | "circle" | "pentagon" | "hexagon";
  count: number;
  color: string;
}

const SHAPES = [
  { name: "triángulo", shape: "triangle" as const, sides: 3, color: "#FF6B35" },
  { name: "cuadrado", shape: "square" as const, sides: 4, color: "#00B894" },
  { name: "rectángulo", shape: "rectangle" as const, sides: 4, color: "#74B9FF" },
  { name: "círculo", shape: "circle" as const, sides: 0, color: "#FDCB6E" },
  { name: "pentágono", shape: "pentagon" as const, sides: 5, color: "#A29BFE" },
  { name: "hexágono", shape: "hexagon" as const, sides: 6, color: "#FF7675" },
];

const STORIES = [
  { person: "Ana", verb: "dibuja" },
  { person: "Mateo", verb: "traza" },
  { person: "Sofía", verb: "dibuja" },
  { person: "Lucas", verb: "calca" },
];

export function generateGeometryScene(
  seed: number,
): VisualProblemData {
  const rng = createSeededRng(seed + 103);
  const shapeDef = rngPick(rng, SHAPES);
  const story = rngPick(rng, STORIES);
  const count = shapeDef.shape === "circle" ? 1 : shapeDef.sides;

  const storyText = `${story.person} ${story.verb} un ${shapeDef.name}.`;
  const question = shapeDef.sides > 0
    ? `🔷 ¿Cuántos lados tiene un ${shapeDef.name}?`
    : `⭕ ¿Cuántos lados tiene un círculo?`;
  const narration = `${storyText} ${question}`;

  const errors = shapeDef.sides > 0
    ? [shapeDef.sides + 1, shapeDef.sides - 1, shapeDef.sides + 2, Math.max(1, shapeDef.sides - 2)]
    : [1, 2, 3, 4];
  const options = generateDistractors(shapeDef.sides, 3, rng, errors);

  const scene: ShapeScene = {
    type: "geometry-shape",
    shape: shapeDef.shape,
    count,
    color: shapeDef.color,
  };

  return { scene: scene as any, story: storyText, question, narration, answer: shapeDef.sides, options: [...options, shapeDef.sides] };
}
