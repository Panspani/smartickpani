/**
 * StarCounter — Stars and streak display.
 *
 * Shows the current star count with a star icon and the streak counter
 * with a 🔥 icon. Displays a "+N" popup animation when bonus stars are
 * awarded, and a "¡Racha de N!" message for streak milestones.
 *
 * Memoized via React.memo — only re-renders when stars or streak change.
 *
 * @module components/StarCounter
 */

import React, { useState, useRef, useEffect } from "react";

export interface StarCounterProps {
  /** Current number of earned stars in the session. */
  stars: number;
  /** Current correct-answer streak. */
  streak: number;
}

/** Streak milestones that trigger special display. */
const STREAK_MILESTONES = new Set([5, 10, 15]);

const StarCounter: React.FC<StarCounterProps> = ({ stars, streak }) => {
  // Track previous values for popup animation
  const prevStarsRef = useRef(stars);
  const prevStreakRef = useRef(streak);
  const [starPopup, setStarPopup] = useState<string | null>(null);
  const [streakPopup, setStreakPopup] = useState<string | null>(null);

  useEffect(() => {
    const prevStars = prevStarsRef.current;
    if (stars > prevStars) {
      const diff = stars - prevStars;
      setStarPopup(`+${diff}`);
      const timer = setTimeout(() => setStarPopup(null), 1200);
      prevStarsRef.current = stars;
      return () => clearTimeout(timer);
    }
    prevStarsRef.current = stars;
  }, [stars]);

  useEffect(() => {
    const prevStreak = prevStreakRef.current;
    if (streak > prevStreak && streak > 1) {
      // Show streak milestone message
      if (STREAK_MILESTONES.has(streak)) {
        setStreakPopup(`¡Racha de ${streak}! 🔥`);
        const timer = setTimeout(() => setStreakPopup(null), 2000);
        prevStreakRef.current = streak;
        return () => clearTimeout(timer);
      }
    }
    prevStreakRef.current = streak;
  }, [streak]);

  return (
    <div className="smartick-star-counter">
      {/* Star count */}
      <div className="smartick-star-counter__stars" aria-label={`${stars} estrellas`}>
        <span className="smartick-star-counter__star-icon">⭐</span>
        <span className="smartick-star-counter__star-count">{stars}</span>
        {starPopup && (
          <span className="smartick-star-counter__popup" key={starPopup}>
            {starPopup}
          </span>
        )}
      </div>

      {/* Streak count */}
      <div className="smartick-star-counter__streak" aria-label={`Racha de ${streak} respuestas correctas`}>
        <span className="smartick-star-counter__fire-icon">🔥</span>
        <span className="smartick-star-counter__streak-count">{streak}</span>
        {streakPopup && (
          <span className="smartick-star-counter__streak-message" key={streakPopup}>
            {streakPopup}
          </span>
        )}
      </div>
    </div>
  );
};

export default React.memo(StarCounter);
