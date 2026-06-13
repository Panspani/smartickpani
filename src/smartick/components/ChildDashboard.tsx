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
          aria-label="Comenzar sesión de matemáticas"
        >
          ¡Comenzar!
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
