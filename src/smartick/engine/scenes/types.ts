/**
 * Scene data types for visual problem scenarios.
 *
 * Each scene describes a visual scenario that can be rendered as SVG
 * and narrated via TTS before showing the question.
 *
 * @module engine/scenes/types
 */

/** A group of identical items (e.g., 3 boxes × 5 balls). */
export interface GroupsScene {
  type: "groups";
  /** Number of groups (e.g., 3 cajas) */
  groups: number;
  /** Items per group (e.g., 5 pelotas) */
  perGroup: number;
  /** Emoji for each item */
  icon: string;
  /** Label for each group (e.g., "caja", "bolsa", "plato") */
  groupLabel: string;
  /** Label for each item (e.g., "pelota", "manzana", "galleta") */
  itemLabel: string;
}

/** An array/grid layout (e.g., 4 rows × 6 chairs). */
export interface ArrayScene {
  type: "array";
  rows: number;
  cols: number;
  icon: string;
  itemLabel: string;
}

/** A number line with jumps. */
export interface NumberLineScene {
  type: "number-line";
  start: number;
  jump: number;
  jumps: number;
  direction: "forward" | "backward";
}

/** A balance scale with items on both sides. */
export interface ScaleScene {
  type: "scale";
  leftItems: number;
  rightItems: number;
  icon: string;
  itemLabel: string;
}

/** A container being filled (capacity). */
export interface FillScene {
  type: "fill";
  containerLabel: string;
  totalCapacity: number;
  currentFill: number;
  unit: string;
  /** Icon for what's being poured */
  icon: string;
}

/** A shop/payment scene. */
export interface ShopScene {
  type: "shop";
  items: Array<{ name: string; price: number; icon: string }>;
  payment: number[];
}

/** A geometry shape scene (triangle, square, etc.). */
export interface GeometryShapeScene {
  type: "geometry-shape";
  shape: "triangle" | "square" | "rectangle" | "circle" | "pentagon" | "hexagon";
  count: number;
  color: string;
}

/** Union of all scene types. */
export type SceneData =
  | GroupsScene
  | ArrayScene
  | NumberLineScene
  | ScaleScene
  | FillScene
  | ShopScene
  | GeometryShapeScene;

/** A complete visual problem with scene + narration. */
export interface VisualProblemData {
  scene: SceneData;
  /** Story text shown on screen (e.g., "Tyler tiene 3 cajas. En cada una hay 5 pelotas.") */
  story: string;
  /** Question text (e.g., "¿Cuántas pelotas tiene en total?") */
  question: string;
  /** Full text for TTS narration */
  narration: string;
  /** Answer */
  answer: number;
  /** Distractors for multiple choice */
  options?: number[];
}
