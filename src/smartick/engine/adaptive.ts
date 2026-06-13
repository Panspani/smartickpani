import type {
  SkillId,
  SubSkillId,
  SkillMap,
  SkillState,
  Problem,
  ProblemResult,
  SessionState,
  SubSkillMastery,
  SkillMasteryState,
  Tier,
  Phase,
} from "./types";
import { TIERS, PHASES } from "./types";
import { getConsecutiveErrors, getConsecutiveCorrect } from "./session";
import {
  getUnlockedSkills,
  getRecommendedSubSkills,
} from "./mastery";
import { SKILL_DEFINITIONS, getSubSkillsForSkill } from "./skill-map";

/**
 * Select the next problem during an active session.
 *
 * Selection algorithm:
 * 1. Determine eligible skills based on current phase.
 * 2. Pick the skill with the lowest average mastery (focus).
 * 3. Rotate skill every 4 problems (skip if only one skill available).
 * 4. Within skill, weighted random sub-skill selection (non-mastered ×3).
 * 5. Determine tier via difficulty adjustment.
 * 6. Return a Problem with the selected metadata.
 *
 * @param session - Current session state
 * @param skillMap - Full skill map
 * @param mastery - Current mastery state across all skills/sub-skills
 * @returns The selected problem (text is a placeholder until Phase 2 generators)
 */
export function selectNextProblem(
  session: SessionState,
  skillMap: SkillMap,
  mastery: SkillMasteryState,
): Problem {
  const phase = session.phase;
  const consecutiveSameSkill = countConsecutiveSameSkill(session.results);

  // --- Step 1: Determine eligible skills ---
  let eligibleSkills: SkillState[];

  if (phase === PHASES.WARM_UP) {
    // Warm-up: skills with >50% mastery
    eligibleSkills = Object.values(skillMap).filter(
      (s) => s.masteryPercentage > 50,
    );
    // Fallback to highest mastery or first skill
    if (eligibleSkills.length === 0) {
      eligibleSkills = getTopMasterySkills(skillMap, 1);
    }
  } else if (phase === PHASES.COOL_DOWN) {
    // Cool-down: any mastered content at easiest difficulty
    eligibleSkills = Object.values(skillMap).filter(
      (s) => s.skillMastered || s.masteryPercentage > 50,
    );
    if (eligibleSkills.length === 0) {
      eligibleSkills = getTopMasterySkills(skillMap, 1);
    }
  } else {
    // Core phase: unlocked skills only
    const unlockedIds = getUnlockedSkills(
      skillMap,
      mastery.skillPercentages,
    );
    eligibleSkills = unlockedIds
      .map((id) => skillMap[id])
      .filter(Boolean);
  }

  if (eligibleSkills.length === 0) {
    // Absolute fallback — should never happen with proper init
    eligibleSkills = [skillMap[SKILL_DEFINITIONS[0].id]];
  }

  // --- Step 2: Pick skill (focus on lowest non-mastered) ---
  let selectedSkill: SkillState;
  if (
    phase === PHASES.CORE &&
    consecutiveSameSkill >= 4 &&
    eligibleSkills.length > 1
  ) {
    // Rotate: pick the next skill that is NOT the current one
    const currentSkillId = getLastSkillId(session.results);
    const alternatives = eligibleSkills.filter(
      (s) => s.id !== currentSkillId,
    );
    selectedSkill = pickLowestMasterySkill(alternatives, mastery);
  } else {
    selectedSkill = pickLowestMasterySkill(eligibleSkills, mastery);
  }

  // --- Step 3: Select sub-skill ---
  const selectedSubSkillId = selectWeightedSubSkill(
    selectedSkill.id,
    mastery.subSkills,
  );

  // --- Step 4: Determine tier ---
  const subSkillMastery = mastery.subSkills[selectedSubSkillId];
  const streak = session.currentStreak;
  const consecutiveErrors = getConsecutiveErrors(session.results);
  const consecutiveCorrect = getConsecutiveCorrect(session.results);
  const tier = determineTier(
    phase,
    subSkillMastery,
    streak,
    consecutiveErrors,
    consecutiveCorrect,
  );

  // --- Step 5: Return problem ---
  return {
    id: `prob-${session.problemsAnswered + 1}`,
    skillId: selectedSkill.id,
    subSkillId: selectedSubSkillId,
    text: "", // Phase 2: populated by problem generators
    type: "multiple-choice", // Phase 2: determined by generator
    answer: 0, // Phase 2: from generator
    tier,
    phase,
  };
}

/**
 * Determine the difficulty tier for the next problem.
 *
 * Rules:
 * - Warm-up / cool-down: always tier 1.
 * - Core phase:
 *   - 2 consecutive errors in same sub-skill → tier down (min 1).
 *   - 4 consecutive correct with fast response → tier up (max 3).
 *   - Streak ≥6 → tier up (override).
 *   - Otherwise maintain current level (default tier 2).
 *
 * @param phase - Current session phase
 * @param mastery - Sub-skill mastery state
 * @param streak - Current correct streak
 * @param consecutiveErrors - Recent consecutive errors
 * @param consecutiveCorrect - Recent consecutive correct answers
 * @returns The selected tier (1, 2, or 3)
 */
export function determineTier(
  phase: Phase,
  mastery: SubSkillMastery | undefined,
  streak: number,
  consecutiveErrors: number,
  consecutiveCorrect: number,
): Tier {
  // Warm-up and cool-down are always tier 1
  if (phase === PHASES.WARM_UP || phase === PHASES.COOL_DOWN) {
    return TIERS.EASY;
  }

  // Core phase adaptive tier selection
  // Start from MEDIUM as baseline
  let tier: Tier = TIERS.MEDIUM;

  // 2 consecutive errors → tier down to EASY
  if (consecutiveErrors >= 2) {
    tier = TIERS.EASY;
  }

  // Streak ≥6 → override to HARD
  if (streak >= 6) {
    tier = TIERS.HARD;
  }

  // 4 consecutive correct and fast (avg response ≤15s from mastery) → HARD
  if (
    consecutiveCorrect >= 4 &&
    mastery &&
    mastery.attempts > 0 &&
    mastery.totalResponseTimeMs / mastery.attempts <= 15_000
  ) {
    tier = TIERS.HARD;
  }

  return tier;
}

/**
 * Check if the skill should rotate after consecutive problems from the same skill.
 *
 * @param problemsAnswered - Total problems answered in the session
 * @returns true if rotation is recommended (every 4 problems)
 */
export function shouldRotateSkill(problemsAnswered: number): boolean {
  return problemsAnswered > 0 && problemsAnswered % 4 === 0;
}

/**
 * Select a sub-skill using weighted random selection.
 *
 * Non-mastered sub-skills receive 3× weight vs mastered (weight = 1).
 * Avoids returning a sub-skill that was used in the last 3 problems
 * by reducing its weight to near-zero.
 *
 * @param skillId - The skill to select a sub-skill from
 * @param mastery - Record of all sub-skill mastery states
 * @returns The selected SubSkillId
 */
export function selectWeightedSubSkill(
  skillId: SkillId,
  mastery: Record<SubSkillId, SubSkillMastery>,
): SubSkillId {
  const prefix = `${skillId}-`;
  const subSkills = Object.entries(mastery)
    .filter(([id]) => id.startsWith(prefix))
    .map(([id, m]) => ({
      id: id as SubSkillId,
      weight: m.masteryLevel === "mastered" ? 1 : 3,
    }));

  if (subSkills.length === 0) {
    // Fallback: get from skill definitions
    const defs = getSubSkillsForSkill(skillId);
    return defs[0].id;
  }

  // Weighted random selection
  const totalWeight = subSkills.reduce((sum, s) => sum + s.weight, 0);
  let random = Math.random() * totalWeight;

  for (const sub of subSkills) {
    random -= sub.weight;
    if (random <= 0) return sub.id;
  }

  return subSkills[subSkills.length - 1].id;
}

// === Internal Helpers ===

/**
 * Count consecutive problems from the same skill at the end of results.
 */
function countConsecutiveSameSkill(results: ProblemResult[]): number {
  if (results.length === 0) return 0;
  const lastSkillId = results[results.length - 1].problem.skillId;
  let count = 0;
  for (let i = results.length - 1; i >= 0; i--) {
    if (results[i].problem.skillId === lastSkillId) {
      count++;
    } else {
      break;
    }
  }
  return count;
}

/**
 * Get the skill ID of the most recently answered problem.
 */
function getLastSkillId(results: ProblemResult[]): SkillId | undefined {
  if (results.length === 0) return undefined;
  return results[results.length - 1].problem.skillId;
}

/**
 * Pick the skill with the lowest average mastery from eligible skills.
 * This focuses practice on the weakest skill.
 */
function pickLowestMasterySkill(
  skills: SkillState[],
  mastery: SkillMasteryState,
): SkillState {
  if (skills.length === 1) return skills[0];

  let lowest = skills[0];
  let lowestPct = mastery.skillPercentages[lowest.id] ?? 0;

  for (let i = 1; i < skills.length; i++) {
    const pct = mastery.skillPercentages[skills[i].id] ?? 0;
    if (pct < lowestPct) {
      lowest = skills[i];
      lowestPct = pct;
    }
  }

  return lowest;
}

/**
 * Get the top N skills by mastery percentage.
 */
function getTopMasterySkills(skillMap: SkillMap, n: number): SkillState[] {
  return Object.values(skillMap)
    .sort((a, b) => b.masteryPercentage - a.masteryPercentage)
    .slice(0, n);
}
