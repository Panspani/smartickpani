import type { Badge, Phase, SkillId } from "./types";
import { BADGE_DEFINITIONS } from "./types";

// === Message Pools (Spanish, 10+ per context) ===

const CORRECT_MESSAGES: string[] = [
  "¡Muy bien!",
  "¡Excelente!",
  "¡Súper!",
  "¡Genial Ana!",
  "¡Así se hace!",
  "¡Perfecto!",
  "¡Eres una campeona!",
  "¡Maravilloso!",
  "¡Fantástico!",
  "¡Buenísimo!",
  "¡Impresionante!",
  "¡Sigue así!",
];

const INCORRECT_MESSAGES: string[] = [
  "¡Casi!",
  "Inténtalo con calma",
  "Tú puedes",
  "¡Otra vez!",
  "No te rindas",
  "Respira hondo",
  "La próxima sale",
  "Tú puedes hacerlo",
  "Vamos, que tú puedes",
  "Un poquito más",
  "¡Ánimo!",
  "Tranquila, sigue pensando",
];

const STREAK_BROKEN_MESSAGES: string[] = [
  "¡Qué racha increíble! Sigue así",
  "¡Buena racha! La próxima será más larga",
  "Tuviste una racha genial, ¡a seguir adelante!",
  "¡Súper racha! No pasa nada, sigue intentando",
];

const STREAK_MILESTONE_MESSAGES: string[] = [
  "¡Racha de {n}! ¡Increíble!",
  "¡{n} seguidas! Eres una máquina",
  "¡Llegaste a {n}! Sigue así",
  "¡{n} correctas! ¡No te detengas!",
];

const SESSION_END_MESSAGES: string[] = [
  "¡Sesión completada! Descansa un poco",
  "¡Muy buen trabajo hoy!",
  "¡Excelente sesión! Nos vemos mañana",
  "¡Lo hiciste genial! Hasta la próxima",
  "¡Gran esfuerzo! Sigue practicando",
  "¡Terminaste! ¿Quieres ver tus resultados?",
];

const BADGE_EARNED_MESSAGES: string[] = [
  "¡Nueva medalla! ¡Felicidades!",
  "¡Ganaste una insignia! Sigue así",
  "¡Medalla desbloqueada! Eres increíble",
  "¡Nuevo logro! ¡Lo hiciste genial!",
];

// === Selection Helpers ===

/**
 * Pick a random item from an array.
 */
function randomPick<T>(pool: T[]): T {
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Pick a random item excluding recently used items.
 * Falls back to full pool if all items are in the recent list.
 */
function randomPickWithAvoid<T>(pool: T[], avoid: T[], avoidCount: number): T {
  const recent = new Set(avoid.slice(-avoidCount));
  const available = pool.filter((item) => !recent.has(item));
  const source = available.length > 0 ? available : pool;
  return source[Math.floor(Math.random() * source.length)];
}

/**
 * Replace {n} placeholder in a message with the given number.
 */
function formatMessage(template: string, n: number): string {
  return template.replace("{n}", String(n));
}

// === Public API ===

/**
 * Compute session star rating (0–3 stars).
 *
 * Rating is based on overall accuracy and streak performance:
 * - 3 stars: ≥90% accuracy AND streak ≥5
 * - 2 stars: ≥70% accuracy
 * - 1 star: ≥40% accuracy
 * - 0 stars: <40% accuracy
 *
 * @param correct - Number of correct answers
 * @param total - Total number of answers
 * @param streak - Maximum streak achieved in the session
 * @returns Star rating 0–3
 */
export function computeStars(
  correct: number,
  total: number,
  streak: number,
): number {
  if (total === 0) return 0;
  const accuracy = correct / total;

  if (accuracy >= 0.9 && streak >= 5) return 3;
  if (accuracy >= 0.7) return 2;
  if (accuracy >= 0.4) return 1;
  return 0;
}

/**
 * Get bonus stars awarded at streak milestones.
 *
 * - Streak 5: 1 bonus star
 * - Streak 10: 3 bonus stars
 * - Streak 15: 5 bonus stars
 *
 * @param streak - Current streak length
 * @returns Number of bonus stars (0 if no milestone)
 */
export function getStreakBonus(streak: number): number {
  if (streak >= 15) return 5;
  if (streak >= 10) return 3;
  if (streak >= 5) return 1;
  return 0;
}

/**
 * Check for newly earned badges based on milestone criteria.
 *
 * This function returns ALL badges that match the given criteria.
 * The caller is responsible for deduplicating against already-earned badges.
 *
 * @param sessionsCompleted - Total sessions completed
 * @param skillsMastered - Number of skills fully mastered
 * @param averageResponseTimeMs - Average response time across recent sessions
 * @returns Array of newly eligible badges (without dedup)
 */
export function checkNewBadges(
  sessionsCompleted: number,
  skillsMastered: number,
  averageResponseTimeMs: number,
): Badge[] {
  const newBadges: Badge[] = [];
  const now = new Date().toISOString();

  if (sessionsCompleted >= 1) {
    newBadges.push({
      ...BADGE_DEFINITIONS.FIRST_SESSION,
      earnedAt: now,
    });
  }

  if (skillsMastered >= 8) {
    newBadges.push({
      ...BADGE_DEFINITIONS.MASTER_MATHEMATICIAN,
      earnedAt: now,
    });
  }

  if (sessionsCompleted >= 5 && averageResponseTimeMs > 0 && averageResponseTimeMs < 15_000) {
    newBadges.push({
      ...BADGE_DEFINITIONS.SPEED_DEMON,
      earnedAt: now,
    });
  }

  return newBadges;
}

/**
 * Select a context-appropriate encouraging message in Spanish.
 *
 * Contexts (per tasks.md API contract):
 * - `correct`: After a correct answer (no repeats within last 3)
 * - `incorrect`: After an incorrect answer (no negative language)
 * - `streak`: Streak-related messages. Use `isStreakBroken` option
 *   to distinguish between milestone (default) and broken-streak messages.
 * - `milestone`: Major milestone event (badge earned, session complete fanfare)
 * - `session-end`: When the session completes
 *
 * @param context - Message context
 * @param options - Optional parameters:
 *   - `recentMessages`: Last N shown messages (for anti-repetition, correct/incorrect only)
 *   - `streakLength`: Current or just-broken streak length
 *   - `isStreakBroken`: When true, 'streak' context returns a broken-streak message
 * @returns A localized encouraging message in Spanish
 */
export function selectMessage(
  context: "correct" | "incorrect" | "streak" | "milestone" | "session-end",
  options?: {
    recentMessages?: string[];
    streakLength?: number;
    isStreakBroken?: boolean;
  },
): string {
  const recent = options?.recentMessages ?? [];
  const streak = options?.streakLength ?? 0;

  switch (context) {
    case "correct": {
      return randomPickWithAvoid(CORRECT_MESSAGES, recent, 3);
    }

    case "incorrect": {
      return randomPickWithAvoid(INCORRECT_MESSAGES, recent, 3);
    }

    case "streak": {
      if (options?.isStreakBroken) {
        return randomPick(STREAK_BROKEN_MESSAGES);
      }
      const template = randomPick(STREAK_MILESTONE_MESSAGES);
      return formatMessage(template, streak);
    }

    case "milestone": {
      return randomPick(BADGE_EARNED_MESSAGES);
    }

    case "session-end": {
      return randomPick(SESSION_END_MESSAGES);
    }
  }
}

/**
 * Get the message pool for a given context (useful for testing).
 */
export function getMessagePool(
  context:
    | "correct"
    | "incorrect"
    | "streak"
    | "milestone"
    | "session-end",
): readonly string[] {
  switch (context) {
    case "correct":
      return CORRECT_MESSAGES;
    case "incorrect":
      return INCORRECT_MESSAGES;
    case "streak":
      return STREAK_MILESTONE_MESSAGES;
    case "milestone":
      return BADGE_EARNED_MESSAGES;
    case "session-end":
      return SESSION_END_MESSAGES;
  }
}
