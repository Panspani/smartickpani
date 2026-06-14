/**
 * Visual capacity / volume scene generator.
 *
 * Uses FillScene for container filling problems.
 *
 * @module engine/scenes/capacity
 */

import type { VisualProblemData, FillScene } from "./types";
import { createSeededRng, rngPick, rngInt, generateDistractors } from "../problems/templates";

const CONTAINERS = [
  { label: "jarra", icon: "water", unit: "ml", maxCap: 200 },
  { label: "botella", icon: "water", unit: "ml", maxCap: 1000 },
  { label: "vaso", icon: "water", unit: "ml", maxCap: 250 },
  { label: "balde", icon: "water", unit: "l", maxCap: 10 },
  { label: "taza", icon: "water", unit: "ml", maxCap: 150 },
];

const STORIES = [
  { person: "Ana", verb: "llena" },
  { person: "Tomás", verb: "sirve" },
  { person: "Lucía", verb: "vierte" },
  { person: "Martín", verb: "prepara" },
];

export function generateCapacityScene(
  seed: number,
): VisualProblemData {
  const rng = createSeededRng(seed + 67);
  const container = rngPick(rng, CONTAINERS);
  const story = rngPick(rng, STORIES);
  const fillPercent = rngInt(rng, 20, 90);
  const currentFill = Math.round(container.maxCap * fillPercent / 100);

  const storyText = `${story.person} ${story.verb} una ${container.label} de ${container.maxCap}${container.unit}.`;
  const question = `¿Cuántos ${container.unit} hay en la ${container.label}?`;
  const narration = `${storyText} Hay ${currentFill}${container.unit}. ${question}`;

  const errors = [
    currentFill + 50, currentFill - 50,
    container.maxCap, Math.round(container.maxCap / 2),
  ];
  const options = generateDistractors(currentFill, 3, rng, errors);

  const scene: FillScene = {
    type: "fill",
    containerLabel: container.label,
    totalCapacity: container.maxCap,
    currentFill,
    unit: container.unit,
    icon: container.icon,
  };

  return { scene, story: storyText, question, narration, answer: currentFill, options: [...options, currentFill] };
}
