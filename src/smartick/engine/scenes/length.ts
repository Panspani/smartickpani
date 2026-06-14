/**
 * Visual length / measurement scene generator.
 *
 * Uses NumberLineScene for ruler-like measurement problems.
 *
 * @module engine/scenes/length
 */

import type { VisualProblemData, NumberLineScene } from "./types";
import { createSeededRng, rngPick, generateDistractors } from "../problems/templates";

const STORIES = [
  { person: "Ana", verb: "mide", item: "su lápiz", unit: "cm" },
  { person: "Tomás", verb: "mide", item: "su regla", unit: "cm" },
  { person: "Lucía", verb: "mide", item: "el largo de la mesa", unit: "cm" },
  { person: "Martín", verb: "mide", item: "el ancho del libro", unit: "cm" },
  { person: "Sofía", verb: "salta", item: "con cuerda", unit: "cm" },
];

export function generateLengthScene(
  start: number,
  jump: number,
  jumps: number,
  seed: number,
): VisualProblemData {
  const rng = createSeededRng(seed + 53);
  const story = rngPick(rng, STORIES);
  const end = start + jump * jumps;

  const storyText = `${story.person} ${story.verb} ${story.item}. Empieza en ${start}${story.unit} y avanza ${jumps} saltos de ${jump}${story.unit}.`;
  const question = `📏 ¿A qué medida llega?`;
  const narration = `${storyText} ${question}`;

  const errors = [end + 1, end - 1, start + jump * (jumps - 1), start + jump * (jumps + 1)];
  const options = generateDistractors(end, 3, rng, errors);

  const scene: NumberLineScene = {
    type: "number-line",
    start,
    jump,
    jumps,
    direction: "forward",
  };

  return { scene, story: storyText, question, narration, answer: end, options: [...options, end] };
}
