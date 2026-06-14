/**
 * Visual division scene generator.
 *
 * Generates story-based division problems with group scenes: sharing equally.
 * Uses the same GroupsScene but with a sharing narrative.
 *
 * @module engine/scenes/division
 */

import type { VisualProblemData, GroupsScene } from "./types";
import { createSeededRng, rngInt, rngPick, generateDistractors } from "../problems/templates";

const STORIES = [
  { person: "Sofía", verb: "reparte", groupNoun: "bolsas", itemNoun: "manzanas", icon: "apple" },
  { person: "Mateo", verb: "distribuye", groupNoun: "platos", itemNoun: "galletas", icon: "cookie" },
  { person: "Valentina", verb: "reparte", groupNoun: "cajas", itemNoun: "caramelos", icon: "candy" },
  { person: "Benjamín", verb: "comparte", groupNoun: "bolsitas", itemNoun: "canicas", icon: "ball" },
  { person: "Camila", verb: "reparte", groupNoun: "macetas", itemNoun: "flores", icon: "flower" },
  { person: "Lucas", verb: "distribuye", groupNoun: "montones", itemNoun: "lápices", icon: "pencil" },
  { person: "Emma", verb: "reparte", groupNoun: "bolsas", itemNoun: "naranjas", icon: "cookie" },
];

const QUESTIONS = [
  "¿Cuántas hay en cada grupo?",
  "¿Cuántos hay en cada grupo?",
];

export function generateDivisionScene(
  total: number,
  groups: number,
  perGroup: number,
  seed: number,
): VisualProblemData {
  const rng = createSeededRng(seed + 41);
  const story = rngPick(rng, STORIES);
  const questionText = rngPick(rng, QUESTIONS);
  const howMany = story.itemNoun.endsWith("as") || story.itemNoun.endsWith("es") ? "Cuántas" : "Cuántos";

  const storyText = `${story.person} ${story.verb} ${total} ${story.itemNoun} en ${groups} ${story.groupNoun}.`;

  const question = `¿${howMany} ${story.itemNoun} hay en cada ${story.groupNoun.slice(0, -1)}?`;
  const narration = `${storyText} ${question}`;

  const errors = [perGroup + 1, perGroup - 1, total - perGroup, groups + perGroup];
  const options = generateDistractors(perGroup, 3, rng, errors);

  const scene: GroupsScene = {
    type: "groups",
    groups,
    perGroup,
    icon: story.icon,
    groupLabel: story.groupNoun,
    itemLabel: story.itemNoun,
  };

  return { scene, story: storyText, question, narration, answer: perGroup, options: [...options, perGroup] };
}
