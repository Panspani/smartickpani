/**
 * gameRouter — Map SubSkillId → contextual mini-game type.
 *
 * Each sub-skill (or sub-skill group) maps to the pedagogical mini-game
 * that best reinforces the concept being practised.
 *
 * @module engine/gameRouter
 */

import { SUB_SKILL_IDS } from "./types";
import type { SubSkillId } from "./types";

export const GAME_TYPES = {
  MEMORY: "memory",
  BALANZA: "balanza",
  BOTELLAS: "botellas",
  RELOJ: "reloj",
  TIENDA: "tienda",
  PUZZLE: "puzzle",
  LABERINTO: "laberinto",
} as const;

export type ContextualGameType =
  (typeof GAME_TYPES)[keyof typeof GAME_TYPES];

/** Fallback for unknown / generic skills. */
const DEFAULT_GAME: ContextualGameType = "memory";

/**
 * Map a SubSkillId to the most relevant contextual mini-game.
 *
 * Order matters — more specific sub-skill checks first, then broader.
 */
export function gameTypeForSubSkill(
  subSkillId: SubSkillId | null,
): ContextualGameType {
  switch (subSkillId) {
    // ══════ Masa (balanza) ══════
    case SUB_SKILL_IDS.MASA_G_KG:
    case SUB_SKILL_IDS.CAP_MASA_CONVERSIONES:
      return GAME_TYPES.BALANZA;

    // ══════ Capacidad (botellas / llenado) ══════
    case SUB_SKILL_IDS.CAP_L_ML:
      return GAME_TYPES.BOTELLAS;

    // ══════ Tiempo (reloj) ══════
    case SUB_SKILL_IDS.TIEMPO_RELOJ:
    case SUB_SKILL_IDS.TIEMPO_HORAS_MIN:
      return GAME_TYPES.RELOJ;

    // ══════ Dinero (tienda / monedas) ══════
    case SUB_SKILL_IDS.DINERO_EUROS:
    case SUB_SKILL_IDS.DINERO_PROBLEMAS:
      return GAME_TYPES.TIENDA;

    // ══════ Geometría / cuerpos → puzzle ══════
    case SUB_SKILL_IDS.FIG_CLASIFICACION:
    case SUB_SKILL_IDS.FIG_PERIMETRO:
    case SUB_SKILL_IDS.FIG_SIMETRIA:
    case SUB_SKILL_IDS.CUERPOS_PRISMAS_PIRAMIDES:
    case SUB_SKILL_IDS.CUERPOS_CILINDROS_CONOS_ESFERAS:
    case SUB_SKILL_IDS.CUERPOS_ARISTAS_VERTICES:
      return GAME_TYPES.PUZZLE;

    // ══════ Longitud — no dedicated game, default ══════
    case SUB_SKILL_IDS.LONG_M_CM_MM:
    case SUB_SKILL_IDS.LONG_CONVERSIONES:
    case SUB_SKILL_IDS.LONG_ESTIMACION:
    // ══════ Problemas de capacidad/masa → memory ══════
    case SUB_SKILL_IDS.CAP_MASA_PROBLEMAS:
    // ══════ Everything else → contextual memory ══════
    default:
      return DEFAULT_GAME;
  }
}
