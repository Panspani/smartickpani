import type {
  SkillId,
  SubSkillId,
  SkillMap,
  SkillState,
  SubSkillAttempt,
  SubSkillMastery,
  SubSkillState,
  MasteryLevel,
  SkillMasteryState,
} from "./types";
import { TRIMESTRES } from "./skill-map";

/**
 * Compute sub-skill mastery from an array of attempts.
 *
 * Criteria (per spec R3):
 * - `mastered`: ≥80% accuracy across last 10 attempts AND avg response ≤30s
 * - `not-mastered`: otherwise
 *
 * Partial data (<10 attempts) still evaluates — mastery requires meeting thresholds
 * even with fewer attempts, but reliability is considered low.
 */
export function computeSubSkillMastery(attempts: SubSkillAttempt[]): MasteryLevel {
  const recent = attempts.slice(-10);
  if (recent.length === 0) return "not-mastered";

  const correctCount = recent.filter((a) => a.isCorrect).length;
  const accuracy = (correctCount / recent.length) * 100;
  const avgResponseTimeMs =
    recent.reduce((sum, a) => sum + a.responseTimeMs, 0) / recent.length;

  if (accuracy >= 80 && avgResponseTimeMs <= 30_000) {
    return "mastered";
  }
  return "not-mastered";
}

/**
 * Compute skill-level mastery percentage (0–100).
 *
 * Percentage = average of all sub-skill accuracies.
 * Returns 0 if no sub-skills are present.
 */
export function computeSkillMasteryPercentage(
  subSkills: Record<SubSkillId, SubSkillMastery>,
): number {
  const entries = Object.values(subSkills);
  if (entries.length === 0) return 0;
  const total = entries.reduce((sum, s) => sum + s.accuracy, 0);
  return Math.round(total / entries.length);
}

/**
 * Determine whether a skill is mastered.
 *
 * A skill is mastered when ≥70% of its sub-skills are mastered
 * (ceil(N × 0.7), where N = number of sub-skills).
 */
export function isSkillMastered(subSkills: SubSkillState[] | SubSkillMastery[]): boolean {
  const N = subSkills.length;
  if (N === 0) return false;
  const threshold = Math.ceil(N * 0.7);
  const masteredCount = subSkills.filter((s) => {
    if ("mastered" in s) return (s as SubSkillState).mastered;
    return (s as SubSkillMastery).masteryLevel === "mastered";
  }).length;
  return masteredCount >= threshold;
}

/**
 * Compute skill master percentage AND mastered boolean in one call.
 */
export function computeSkillMastery(
  subSkills: Record<SubSkillId, SubSkillMastery>,
): { percentage: number; mastered: boolean } {
  const subArray = Object.values(subSkills);
  const percentage = computeSkillMasteryPercentage(subSkills);
  const mastered = isSkillMastered(subArray);
  return { percentage, mastered };
}

/**
 * Get unlocked skills based on progression rules.
 *
 * Rules:
 * - skill-05 is always unlocked (first skill).
 * - Within a trimester, skills unlock sequentially: next skill requires
 *   previous skill at ≥40% mastery.
 * - Cross-trimester gate: require ≥3 Trimestre 2 skills at ≥60% mastery
 *   before any Trimestre 3 skill unlocks.
 * - Within Trimestre 3, sequential unlock at 40% threshold applies again.
 *
 * @param skillMap - Full skill map with all skill states
 * @param mastery - Record of SkillId → mastery percentage (0–100)
 * @returns Array of unlocked SkillIds in order
 */
export function getUnlockedSkills(
  skillMap: SkillMap,
  mastery: Record<SkillId, number>,
): SkillId[] {
  const unlocked: SkillId[] = [];
  const getPct = (id: SkillId): number => mastery[id] ?? 0;

  // --- Trimestre 2 (skill-05 through skill-08) ---
  const t2Skills = TRIMESTRES[2];
  // skill-05 always unlocked
  unlocked.push(t2Skills[0]);
  // Sequential unlock within T2
  for (let i = 1; i < t2Skills.length; i++) {
    const prevPct = getPct(t2Skills[i - 1]);
    if (prevPct >= 40) {
      unlocked.push(t2Skills[i]);
    } else {
      break;
    }
  }

  // --- Cross-trimester gate ---
  const t2CountAt60 = t2Skills.filter((id) => getPct(id) >= 60).length;
  if (t2CountAt60 >= 3) {
    // --- Trimestre 3 (skill-09 through skill-12) ---
    const t3Skills = TRIMESTRES[3];
    // First T3 skill unlocks if gate passes
    unlocked.push(t3Skills[0]);
    // Sequential unlock within T3
    for (let i = 1; i < t3Skills.length; i++) {
      const prevPct = getPct(t3Skills[i - 1]);
      if (prevPct >= 40) {
        unlocked.push(t3Skills[i]);
      } else {
        break;
      }
    }
  }

  return unlocked;
}

/**
 * Get recommended sub-skills for a skill, prioritizing lowest mastery first.
 *
 * @param skillId - The skill to get sub-skills for
 * @param mastery - Record of SubSkillId → SubSkillMastery
 * @returns SubSkillIds sorted by ascending accuracy (least mastered first)
 */
export function getRecommendedSubSkills(
  skillId: SkillId,
  mastery: Record<SubSkillId, SubSkillMastery>,
): SubSkillId[] {
  const prefix = `${skillId}-`;
  const entries = Object.entries(mastery)
    .filter(([id]) => id.startsWith(prefix))
    .map(([id, m]) => ({ id: id as SubSkillId, accuracy: m.accuracy }));

  // Sort ascending: lowest accuracy first (most needs practice)
  entries.sort((a, b) => a.accuracy - b.accuracy);

  return entries.map((e) => e.id);
}
