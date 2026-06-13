import type { SkillId, SubSkillId, SkillMap, SkillState, SubSkillState } from "./types";
import { SUB_SKILL_IDS, SKILL_IDS } from "./types";

// === Skill & Sub-Skill Definitions ===

export interface SkillDefinition {
  id: SkillId;
  name: string;
  unidad: number;    // 5–12
  trimestre: number; // 2 | 3
}

export interface SubSkillDefinition {
  id: SubSkillId;
  name: string;
  skillId: SkillId;
}

/**
 * All 8 skills matching 3rd-grade curriculum Unidad 5–12.
 * Order determines default unlock sequence.
 */
export const SKILL_DEFINITIONS: SkillDefinition[] = [
  { id: SKILL_IDS.UNIDAD_5, name: "Práctica de la multiplicación", unidad: 5, trimestre: 2 },
  { id: SKILL_IDS.UNIDAD_6, name: "La división", unidad: 6, trimestre: 2 },
  { id: SKILL_IDS.UNIDAD_7, name: "Práctica de la división", unidad: 7, trimestre: 2 },
  { id: SKILL_IDS.UNIDAD_8, name: "Las figuras planas", unidad: 8, trimestre: 2 },
  { id: SKILL_IDS.UNIDAD_9, name: "Medidas de longitud", unidad: 9, trimestre: 3 },
  { id: SKILL_IDS.UNIDAD_10, name: "La capacidad y la masa", unidad: 10, trimestre: 3 },
  { id: SKILL_IDS.UNIDAD_11, name: "El tiempo y el dinero", unidad: 11, trimestre: 3 },
  { id: SKILL_IDS.UNIDAD_12, name: "Los cuerpos geométricos", unidad: 12, trimestre: 3 },
];

/**
 * All 27 sub-skills with their parent skill.
 * Matches the exact Spanish names from the curriculum.
 */
export const SUB_SKILL_DEFINITIONS: SubSkillDefinition[] = [
  // Unidad 5 — Práctica de la multiplicación (4 sub-skills)
  { id: SUB_SKILL_IDS.TABLAS_1_10, name: "Tablas del 1 al 10", skillId: SKILL_IDS.UNIDAD_5 },
  { id: SUB_SKILL_IDS.MULT_1_CIFRA, name: "Multiplicaciones por 1 cifra", skillId: SKILL_IDS.UNIDAD_5 },
  { id: SUB_SKILL_IDS.MULT_2_CIFRAS, name: "Multiplicaciones por 2 cifras", skillId: SKILL_IDS.UNIDAD_5 },
  { id: SUB_SKILL_IDS.MULT_PROBLEMAS, name: "Problemas de multiplicación", skillId: SKILL_IDS.UNIDAD_5 },

  // Unidad 6 — La división (3 sub-skills)
  { id: SUB_SKILL_IDS.DIV_EXACTAS, name: "Divisiones exactas (por 1 cifra)", skillId: SKILL_IDS.UNIDAD_6 },
  { id: SUB_SKILL_IDS.DIV_RELACION_MULT, name: "Relación multiplicación-división", skillId: SKILL_IDS.UNIDAD_6 },
  { id: SUB_SKILL_IDS.DIV_PROBLEMAS, name: "Problemas de división", skillId: SKILL_IDS.UNIDAD_6 },

  // Unidad 7 — Práctica de la división (3 sub-skills)
  { id: SUB_SKILL_IDS.DIV_CON_RESTO, name: "Divisiones con resto", skillId: SKILL_IDS.UNIDAD_7 },
  { id: SUB_SKILL_IDS.DIV_2_CIFRAS, name: "Divisiones por 2 cifras", skillId: SKILL_IDS.UNIDAD_7 },
  { id: SUB_SKILL_IDS.DIV_PROBLEMAS_AVANZADOS, name: "Problemas con división", skillId: SKILL_IDS.UNIDAD_7 },

  // Unidad 8 — Las figuras planas (3 sub-skills)
  { id: SUB_SKILL_IDS.FIG_CLASIFICACION, name: "Clasificación de figuras", skillId: SKILL_IDS.UNIDAD_8 },
  { id: SUB_SKILL_IDS.FIG_PERIMETRO, name: "Perímetro", skillId: SKILL_IDS.UNIDAD_8 },
  { id: SUB_SKILL_IDS.FIG_SIMETRIA, name: "Simetría", skillId: SKILL_IDS.UNIDAD_8 },

  // Unidad 9 — Medidas de longitud (3 sub-skills)
  { id: SUB_SKILL_IDS.LONG_M_CM_MM, name: "m, cm, mm", skillId: SKILL_IDS.UNIDAD_9 },
  { id: SUB_SKILL_IDS.LONG_CONVERSIONES, name: "Conversiones entre unidades", skillId: SKILL_IDS.UNIDAD_9 },
  { id: SUB_SKILL_IDS.LONG_ESTIMACION, name: "Estimación y medición", skillId: SKILL_IDS.UNIDAD_9 },

  // Unidad 10 — La capacidad y la masa (4 sub-skills)
  { id: SUB_SKILL_IDS.CAP_L_ML, name: "l, ml (capacidad)", skillId: SKILL_IDS.UNIDAD_10 },
  { id: SUB_SKILL_IDS.MASA_G_KG, name: "g, kg (masa)", skillId: SKILL_IDS.UNIDAD_10 },
  { id: SUB_SKILL_IDS.CAP_MASA_CONVERSIONES, name: "Conversiones", skillId: SKILL_IDS.UNIDAD_10 },
  { id: SUB_SKILL_IDS.CAP_MASA_PROBLEMAS, name: "Problemas de capacidad y masa", skillId: SKILL_IDS.UNIDAD_10 },

  // Unidad 11 — El tiempo y el dinero (4 sub-skills)
  { id: SUB_SKILL_IDS.TIEMPO_RELOJ, name: "Lectura de reloj analógico/digital", skillId: SKILL_IDS.UNIDAD_11 },
  { id: SUB_SKILL_IDS.TIEMPO_HORAS_MIN, name: "Horas, minutos", skillId: SKILL_IDS.UNIDAD_11 },
  { id: SUB_SKILL_IDS.DINERO_EUROS, name: "Euros y céntimos", skillId: SKILL_IDS.UNIDAD_11 },
  { id: SUB_SKILL_IDS.DINERO_PROBLEMAS, name: "Problemas con dinero", skillId: SKILL_IDS.UNIDAD_11 },

  // Unidad 12 — Los cuerpos geométricos (3 sub-skills)
  { id: SUB_SKILL_IDS.CUERPOS_PRISMAS_PIRAMIDES, name: "Prismas y pirámides", skillId: SKILL_IDS.UNIDAD_12 },
  { id: SUB_SKILL_IDS.CUERPOS_CILINDROS_CONOS_ESFERAS, name: "Cilindros, conos, esferas", skillId: SKILL_IDS.UNIDAD_12 },
  { id: SUB_SKILL_IDS.CUERPOS_ARISTAS_VERTICES, name: "Aristas, vértices, caras", skillId: SKILL_IDS.UNIDAD_12 },
];

/**
 * Trimestre grouping.
 * Trimestre 2: skill-05 through skill-08 (Unidad 5–8)
 * Trimestre 3: skill-09 through skill-12 (Unidad 9–12)
 */
export const TRIMESTRES: Record<number, SkillId[]> = {
  2: [SKILL_IDS.UNIDAD_5, SKILL_IDS.UNIDAD_6, SKILL_IDS.UNIDAD_7, SKILL_IDS.UNIDAD_8],
  3: [SKILL_IDS.UNIDAD_9, SKILL_IDS.UNIDAD_10, SKILL_IDS.UNIDAD_11, SKILL_IDS.UNIDAD_12],
};

/**
 * Returns sub-skill definitions belonging to a given skill.
 */
export function getSubSkillsForSkill(skillId: SkillId): SubSkillDefinition[] {
  return SUB_SKILL_DEFINITIONS.filter((s) => s.skillId === skillId);
}

/**
 * Builds a fresh SkillMap with all 8 skills and 27 sub-skills
 * initialized to zero mastery.
 */
export function buildInitialSkillMap(): SkillMap {
  const map = {} as SkillMap;

  for (const skillDef of SKILL_DEFINITIONS) {
    const subSkillDefs = SUB_SKILL_DEFINITIONS.filter(
      (s) => s.skillId === skillDef.id,
    );

    const subSkills: SubSkillState[] = subSkillDefs.map((s) => ({
      id: s.id,
      name: s.name,
      mastered: false,
      accuracy: 0,
      attempts: 0,
      correctCount: 0,
      totalResponseTimeMs: 0,
      lastAttempts: [],
    }));

    map[skillDef.id] = {
      id: skillDef.id,
      name: skillDef.name,
      unidad: skillDef.unidad,
      trimestre: skillDef.trimestre,
      skillMastered: false,
      masteryPercentage: 0,
      lastPracticed: null,
      subSkills,
    };
  }

  return map;
}
