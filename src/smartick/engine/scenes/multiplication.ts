/**
 * Visual multiplication problem generator.
 *
 * Generates story-based multiplication problems with group scenes:
 *   "Tyler tiene 3 cajas. En cada caja hay 5 pelotas. ¿Cuántas pelotas tiene?"
 *
 * @module engine/scenes/multiplication
 */

import type { VisualProblemData, GroupsScene } from "./types";
import { createSeededRng, rngInt, rngPick, generateDistractors } from "../problems/templates";

// ── Story templates ─────────────────────────────

interface StoryTemplate {
  /** Noun for the person/character */
  person: string;
  /** Possessive article */
  pos: string;
  /** Verb (tiene, compra, hornea, etc.) */
  verb: string;
  /** Group noun (cajas, bolsas, bandejas, etc.) */
  groupNoun: string;
  /** Item noun in plural (pelotas, manzanas, galletas, etc.) */
  itemNoun: string;
  /** Emoji for the item */
  icon: string;
}

const STORIES: StoryTemplate[] = [
  { person: "Tyler", pos: "de Tyler", verb: "tiene", groupNoun: "cajas", itemNoun: "pelotas", icon: "ball" },
  { person: "Sofía", pos: "de Sofía", verb: "compra", groupNoun: "bolsas", itemNoun: "manzanas", icon: "apple" },
  { person: "Mateo", pos: "de Mateo", verb: "hornea", groupNoun: "bandejas", itemNoun: "galletas", icon: "cookie" },
  { person: "Valentina", pos: "de Valentina", verb: "prepara", groupNoun: "platos", itemNoun: "empanadas", icon: "star" },
  { person: "Benjamín", pos: "de Benjamín", verb: "arma", groupNoun: "bolsitas", itemNoun: "caramelos", icon: "candy" },
  { person: "Camila", pos: "de Camila", verb: "planta", groupNoun: "macetas", itemNoun: "flores", icon: "flower" },
  { person: "Lucas", pos: "de Lucas", verb: "dibuja", groupNoun: "cartulinas", itemNoun: "estrellas", icon: "star" },
  { person: "Emma", pos: "de Emma", verb: "tiene", groupNoun: "frascos", itemNoun: "canicas", icon: "ball" },
  { person: "Thiago", pos: "de Thiago", verb: "pone", groupNoun: "cajas", itemNoun: "lápices", icon: "pencil" },
  { person: "Isabella", pos: "de Isabella", verb: "tiene", groupNoun: "bolsas", itemNoun: "naranjas", icon: "cookie" },
  { person: "Dylan", pos: "de Dylan", verb: "colecciona", groupNoun: "álbumes", itemNoun: "figuritas", icon: "star" },
];

/** How the question is phrased depending on the story. */
const QUESTIONS: string[] = [
  "¿Cuántas tiene en total?",
  "¿Cuántas hay en total?",
  "¿Cuántos hay en total?",
];

/**
 * Generate a visual multiplication problem using groups.
 */
export function generateMultiplicationScene(
  a: number,
  b: number,
  product: number,
  seed: number,
): VisualProblemData {
  const rng = createSeededRng(seed + 37);
  const story = rngPick(rng, STORIES);
  const questionText = rngPick(rng, QUESTIONS);

  // Pick the right gender for "cuántas/os"
  const isFem = story.itemNoun.endsWith("as") || story.itemNoun.endsWith("es");
  const howMany = isFem ? "¿Cuántas" : "¿Cuántos";
  const totalWord = isFem ? "hay" : "hay"; // same
  const question = `${howMany} ${story.itemNoun} ${totalWord} en total?`;

  const storyText = `${story.person} ${story.verb} ${a} ${story.groupNoun}. En cada ${story.groupNoun.slice(0, -1)} ${story.groupNoun === "cajas" ? "hay" : story.verb === "tiene" ? "tiene" : "hay"} ${b} ${story.itemNoun}.`;

  const narrationText = `${storyText} ${question}`;

  const errors = [
    product + 1,
    product - 1,
    a + b,
    (a + 1) * b,
    a * (b + 1),
    a + b + 2,
  ];

  const options = generateDistractors(product, 3, rng, errors);

  const scene: GroupsScene = {
    type: "groups",
    groups: a,
    perGroup: b,
    icon: story.icon,
    groupLabel: story.groupNoun,
    itemLabel: story.itemNoun,
  };

  return {
    scene,
    story: storyText,
    question,
    narration: narrationText,
    answer: product,
    options: [...options, product],
  };
}
