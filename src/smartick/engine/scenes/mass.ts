/**
 * Visual mass / balance scene generator.
 *
 * Uses ScaleScene for balance comparison problems.
 *
 * @module engine/scenes/mass
 */

import type { VisualProblemData, ScaleScene } from "./types";
import { createSeededRng, rngInt, rngPick, generateDistractors } from "../problems/templates";

const ITEMS = [
  { name: "manzanas", icon: "apple" },
  { name: "naranjas", icon: "cookie" },
  { name: "canicas", icon: "ball" },
  { name: "pelotas", icon: "ball" },
  { name: "libros", icon: "book" },
  { name: "galletas", icon: "cookie" },
];

const STORIES = [
  { person: "Sofía", verb: "pesa" },
  { person: "Mateo", verb: "coloca" },
  { person: "Valentina", verb: "pone" },
  { person: "Benjamín", verb: "balancea" },
];

export function generateMassScene(
  seed: number,
): VisualProblemData {
  const rng = createSeededRng(seed + 79);
  const item = rngPick(rng, ITEMS);
  const story = rngPick(rng, STORIES);
  const leftItems = rngInt(rng, 1, 6);
  const rightItems = rngInt(rng, 1, 6);
  const total = leftItems + rightItems;

  const storyText = `${story.person} ${story.verb} ${leftItems} ${item.name} a la izquierda y ${rightItems} a la derecha.`;
  const question = `¿Cuántas ${item.name} hay en total?`;
  const narration = `${storyText} ${question}`;

  const errors = [total + 1, total - 1, Math.abs(leftItems - rightItems), Math.max(leftItems, rightItems)];
  const options = generateDistractors(total, 3, rng, errors);

  const scene: ScaleScene = {
    type: "scale",
    leftItems,
    rightItems,
    icon: item.icon,
    itemLabel: item.name,
  };

  return { scene, story: storyText, question, narration, answer: total, options: [...options, total] };
}
