/**
 * ChildDashboard — Home / dashboard screen for the child.
 *
 * Displays:
 *   - Grid of skill rings (one per unlocked skill)
 *   - Streak calendar (7-day row)
 *   - Badge display (recent badges)
 *   - "Vista de padres" button (small, bottom)
 *   - "¡Comenzar!" button (prominent, center)
 *
 * @module components/ChildDashboard
 */

import React, { useMemo } from "react";
import type { SkillId } from "../engine/types";
import { SKILL_DEFINITIONS } from "../engine/skill-map";
import { getUnlockedSkills } from "../engine/mastery";
import { useStorage } from "../hooks/useStorage";
import SkillRing from "./SkillRing";
import StreakCalendar from "./StreakCalendar";
import BadgeDisplay from "./BadgeDisplay";
import StartScreen from "./StartScreen";

export interface ChildDashboardProps {
  onStart: () => void;
  onParentGate: () => void;
}

const ChildDashboard: React.FC<ChildDashboardProps> = ({
  onStart,
  onParentGate,
}) => {
  const storage = useStorage();

  // Determine if this is the first visit (no sessions yet)
  const isFirstVisit = !storage.isLoaded || storage.sessions.length === 0;

  // Compute unlocked skills
  const unlockedSkills = useMemo(() => {
    if (!storage.isLoaded) return [];
    const skillPercentages = {} as Record<SkillId, number>;
    for (const skill of Object.values(storage.skillState)) {
      skillPercentages[skill.id] = skill.masteryPercentage;
    }
    return getUnlockedSkills(storage.skillState, skillPercentages);
  }, [storage.isLoaded, storage.skillState]);

  // Build skill state array for unlocked skills
  const unlockedSkillStates = useMemo(() => {
    if (!storage.isLoaded) return [];
    return unlockedSkills
      .map((id) => storage.skillState[id])
      .filter(Boolean);
  }, [storage.isLoaded, unlockedSkills, storage.skillState]);

  // Get recent badges (earned, sorted by date)
  const recentBadges = useMemo(() => {
    return storage.badges
      .filter((b) => b.earnedAt !== null)
      .sort(
        (a, b) =>
          new Date(b.earnedAt!).getTime() - new Date(a.earnedAt!).getTime(),
      );
  }, [storage.badges]);

  if (!storage.isLoaded) {
    return (
      <div className="smartick-dashboard">
        <p className="smartick-dashboard__loading">Cargando...</p>
      </div>
    );
  }

  // Show welcome/start screen on first visit
  if (isFirstVisit) {
    return <StartScreen onStart={onStart} />;
  }

  return (
    <div className="smartick-dashboard">
      {/* Adventure theme decorative SVGs — non-interactive */}
      <svg
        className="smartick-dashboard__deco-compass"
        viewBox="0 0 100 100"
        aria-hidden="true"
      >
        <circle cx="50" cy="50" r="45" fill="none" stroke="#FF6B35" strokeWidth="2" />
        <polygon points="50,10 55,45 50,50 45,45" fill="#FF6B35" />
        <polygon points="50,90 55,55 50,50 45,55" fill="#E55A2B" />
        <polygon points="10,50 45,45 50,50 45,55" fill="#FFB347" />
        <polygon points="90,50 55,45 50,50 55,55" fill="#FF8A5C" />
        <circle cx="50" cy="50" r="3" fill="#FF6B35" />
      </svg>

      <svg
        className="smartick-dashboard__deco-map"
        viewBox="0 0 100 100"
        aria-hidden="true"
      >
        <path d="M10 90 L10 20 Q10 10 20 10 L80 10 Q90 10 90 20 L90 80 Q90 90 80 90 Z" fill="none" stroke="#FFB347" strokeWidth="2" strokeDasharray="3,3" />
        <path d="M20 30 L40 50 L60 30 L80 50" fill="none" stroke="#FF6B35" strokeWidth="1.5" />
        <text x="50" y="70" textAnchor="middle" fontSize="14" fill="#FF6B35">🗺</text>
      </svg>

      <svg
        className="smartick-dashboard__deco-wheel"
        viewBox="0 0 100 100"
        aria-hidden="true"
      >
        <circle cx="50" cy="50" r="22" fill="none" stroke="#FF6B35" strokeWidth="2" />
        <line x1="50" y1="5" x2="50" y2="28" stroke="#FFB347" strokeWidth="2" />
        <line x1="50" y1="72" x2="50" y2="95" stroke="#FFB347" strokeWidth="2" />
        <line x1="5" y1="50" x2="28" y2="50" stroke="#FF8A5C" strokeWidth="2" />
        <line x1="72" y1="50" x2="95" y2="50" stroke="#FF8A5C" strokeWidth="2" />
        <line x1="18" y1="18" x2="34" y2="34" stroke="#E55A2B" strokeWidth="1.5" />
        <line x1="66" y1="66" x2="82" y2="82" stroke="#E55A2B" strokeWidth="1.5" />
        <line x1="82" y1="18" x2="66" y2="34" stroke="#E55A2B" strokeWidth="1.5" />
        <line x1="34" y1="66" x2="18" y2="82" stroke="#E55A2B" strokeWidth="1.5" />
        <circle cx="50" cy="50" r="5" fill="#FF6B35" />
      </svg>

      <div className="smartick-dashboard__deco-waves" aria-hidden="true">
        <svg viewBox="0 0 400 40" width="100%" height="40" preserveAspectRatio="none">
          <path d="M0 20 Q50 5 100 20 T200 20 T300 20 T400 20 L400 40 L0 40 Z" fill="#FF6B35" />
          <path d="M0 25 Q50 12 100 25 T200 25 T300 25 T400 25 L400 40 L0 40 Z" fill="#FFB347" opacity="0.6" />
        </svg>
      </div>

      <div className="smartick-dashboard__header">
        <h1 className="smartick-dashboard__title">¡MateSmart!</h1>
        <p className="smartick-dashboard__subtitle">
          Matemáticas adaptativas para Ana
        </p>
      </div>

      {/* Start button — prominent */}
      <div className="smartick-dashboard__start-area">
        <button
          className="smartick-dashboard__start-button"
          onClick={onStart}
          type="button"
          aria-label="Comenzar nueva aventura"
        >
          ¡Nueva aventura! 🧭
        </button>
      </div>

      {/* Skill rings grid */}
      {unlockedSkillStates.length > 0 && (
        <section className="smartick-dashboard__section">
          <h2 className="smartick-dashboard__section-title">Tus habilidades</h2>
          <div className="smartick-dashboard__skills-grid">
            {unlockedSkillStates.map((skill) => (
              <SkillRing
                key={skill.id}
                name={skill.name}
                percentage={skill.masteryPercentage}
                subSkills={skill.subSkills.map((s) => ({
                  name: s.name,
                  accuracy: s.accuracy,
                  mastered: s.mastered,
                }))}
              />
            ))}
          </div>
        </section>
      )}

      {/* Streak calendar */}
      <section className="smartick-dashboard__section">
        <StreakCalendar
          streakDays={storage.settings.streakDays}
          lastActivityDate={storage.settings.lastActivityDate}
          sessions={storage.sessions}
        />
      </section>

      {/* Badge display */}
      <section className="smartick-dashboard__section">
        <BadgeDisplay
          allBadges={storage.badges}
          recentBadges={recentBadges}
        />
      </section>

      {/* Parent gate button */}
      <div className="smartick-dashboard__parent-area">
        <button
          className="smartick-dashboard__parent-button"
          onClick={onParentGate}
          type="button"
          aria-label="Vista de padres"
        >
          Vista de padres
        </button>
      </div>
    </div>
  );
};

export default ChildDashboard;
