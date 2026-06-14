/**
 * Visual money / shop scene generator.
 *
 * Uses ShopScene for buying items and calculating total/change.
 *
 * @module engine/scenes/money
 */

import type { VisualProblemData, ShopScene } from "./types";
import { createSeededRng, rngInt, rngPick, generateDistractors } from "../problems/templates";

const SHOP_ITEMS = [
  { name: "manzana", price: 2, icon: "🍎" },
  { name: "galleta", price: 3, icon: "🍪" },
  { name: "lápiz", price: 1, icon: "✏️" },
  { name: "cuaderno", price: 4, icon: "📓" },
  { name: "goma", price: 2, icon: "🧹" },
  { name: "juguete", price: 5, icon: "🧸" },
  { name: "chocolate", price: 2, icon: "🍫" },
  { name: "agua", price: 1, icon: "💧" },
];

const STORIES = [
  { person: "Ana", verb: "compra" },
  { person: "Tomás", verb: "compra" },
  { person: "Lucía", verb: "elige" },
  { person: "Martín", verb: "lleva" },
];

export function generateMoneyScene(
  seed: number,
): VisualProblemData {
  const rng = createSeededRng(seed + 91);
  const story = rngPick(rng, STORIES);
  const itemCount = rngInt(rng, 2, 3);
  const items: Array<{ name: string; price: number; icon: string }> = [];
  const used = new Set<number>();
  for (let i = 0; i < itemCount; i++) {
    let idx: number;
    do { idx = rngInt(rng, 0, SHOP_ITEMS.length - 1); } while (used.has(idx));
    used.add(idx);
    items.push(SHOP_ITEMS[idx]);
  }
  const total = items.reduce((s, it) => s + it.price, 0);
  const paymentAmount = total; // paying exact
  const payment = [paymentAmount];

  const itemList = items.map((it) => `${it.icon} ${it.name} (${it.price}€)`).join(", ");
  const storyText = `${story.person} ${story.verb} ${itemList}.`;
  const question = `🛒 ¿Cuánto gasta en total?`;
  const narration = `${storyText} ${question}`;

  const errors = [
    total + 1, total - 1,
    items[0].price + (items[1]?.price ?? 0),
    items[0].price * items.length,
  ];
  const options = generateDistractors(total, 3, rng, errors);

  const scene: ShopScene = {
    type: "shop",
    items,
    payment,
  };

  return { scene, story: storyText, question, narration, answer: total, options: [...options, total] };
}
