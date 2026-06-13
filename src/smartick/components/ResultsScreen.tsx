/**
 * ResultsScreen — End-of-session summary.
 *
 * Displays the results of a completed session:
 *   - Stars earned (0–3) with reveal animation
 *   - Correct / Total display
 *   - New badges with glow animation
 *   - Confetti animation (CSS @keyframes, ≤50 particles)
 *   - Encouraging message from the scoring.ts message pool
 *   - "Volver" button → navigate to dashboard
 *
 * @module components/ResultsScreen
 */

import React, { useMemo, useEffect, useState } from "react";
import type { SessionResult, Badge } from "../engine/types";
import { computeStars, selectMessage } from "../engine/scoring";
import { useStorage } from "../hooks/useStorage";

export interface ResultsScreenProps {
  /** The session result ID to look up. */
  sessionResultId: string | null;
  /** Callback to navigate back to the home/dashboard view. */
  onGoHome: () => void;
}

/** Generate deterministic confetti particles (≤50). */
function generateConfetti(): Array<{
  id: number;
  left: string;
  delay: string;
  duration: string;
  color: string;
  size: string;
}> {
  const COLORS = [
    "var(--smartick-confetti-1, #ff6b6b)",
    "var(--smartick-confetti-2, #ffd93d)",
    "var(--smartick-confetti-3, #6bcb77)",
    "var(--smartick-confetti-4, #4d96ff)",
    "#ff9ff3",
    "#f368e0",
  ];

  const particles = [];
  const count = Math.min(50, 30 + Math.floor(Math.random() * 20));

  for (let i = 0; i < count; i++) {
    particles.push({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 2}s`,
      duration: `${2 + Math.random() * 2}s`,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: `${6 + Math.random() * 8}px`,
    });
  }

  return particles;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({
  sessionResultId,
  onGoHome,
}) => {
  const storage = useStorage();
  const [showContent, setShowContent] = useState(false);
  const [starsAnimated, setStarsAnimated] = useState(false);

  // Find the session result
  const result: SessionResult | null = useMemo(() => {
    if (!sessionResultId) return null;
    return storage.sessions.find((s) => s.id === sessionResultId) ?? null;
  }, [sessionResultId, storage.sessions]);

  // Confetti particles (stable across renders)
  const confetti = useMemo(() => generateConfetti(), []);

  // Animate content in after mount
  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Animate stars after content appears
  useEffect(() => {
    if (showContent) {
      const timer = setTimeout(() => setStarsAnimated(true), 500);
      return () => clearTimeout(timer);
    }
  }, [showContent]);

  if (!result) {
    return (
      <div className="smartick-results-screen">
        <div className="smartick-results-screen__content">
          <p className="smartick-results-screen__loading">
            Cargando resultados...
          </p>
          <button
            className="smartick-results-screen__back-button"
            onClick={onGoHome}
            type="button"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  const starRating = computeStars(
    result.problems.filter((p) => p.isCorrect).length,
    result.problems.length,
    result.streakMax,
  );

  const endMessage = selectMessage("session-end");
  const hasBadges = result.badgesEarned && result.badgesEarned.length > 0;

  return (
    <div className="smartick-results-screen">
      {/* Confetti */}
      <div className="smartick-results-screen__confetti" aria-hidden="true">
        {confetti.map((p) => (
          <span
            key={p.id}
            className="smartick-results-screen__confetti-particle"
            style={{
              left: p.left,
              animationDelay: p.delay,
              animationDuration: p.duration,
              backgroundColor: p.color,
              width: p.size,
              height: p.size,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div
        className={`smartick-results-screen__content ${
          showContent ? "smartick-results-screen__content--visible" : ""
        }`}
      >
        <h2 className="smartick-results-screen__title">{endMessage}</h2>

        {/* Stars */}
        <div className="smartick-results-screen__stars" aria-label={`${starRating} de 3 estrellas`}>
          {[1, 2, 3].map((star) => (
            <span
              key={star}
              className={`smartick-results-screen__star ${
                starsAnimated && star <= starRating
                  ? "smartick-results-screen__star--earned"
                  : "smartick-results-screen__star--empty"
              }`}
              style={{ animationDelay: `${star * 0.3}s` }}
            >
              ★
            </span>
          ))}
        </div>

        {/* Stats */}
        <div className="smartick-results-screen__stats">
          <div className="smartick-results-screen__stat">
            <span className="smartick-results-screen__stat-value">
              {result.problems.filter((p) => p.isCorrect).length}
            </span>
            <span className="smartick-results-screen__stat-label">
              Correctas
            </span>
          </div>
          <div className="smartick-results-screen__stat">
            <span className="smartick-results-screen__stat-value">
              {result.problems.length}
            </span>
            <span className="smartick-results-screen__stat-label">
              Totales
            </span>
          </div>
          <div className="smartick-results-screen__stat">
            <span className="smartick-results-screen__stat-value">
              {result.accuracy}%
            </span>
            <span className="smartick-results-screen__stat-label">
              Precisión
            </span>
          </div>
          <div className="smartick-results-screen__stat">
            <span className="smartick-results-screen__stat-value">
              {result.streakMax}
            </span>
            <span className="smartick-results-screen__stat-label">
              Racha máxima
            </span>
          </div>
        </div>

        {/* Badges earned */}
        {hasBadges && (
          <div className="smartick-results-screen__badges">
            <h3 className="smartick-results-screen__badges-title">
              ¡Nuevas medallas!
            </h3>
            <div className="smartick-results-screen__badges-grid">
              {result.badgesEarned.map((badge: Badge) => (
                <div
                  key={badge.id}
                  className="smartick-results-screen__badge smartick-results-screen__badge--new"
                >
                  <span className="smartick-results-screen__badge-icon">🏅</span>
                  <span className="smartick-results-screen__badge-name">
                    {badge.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Back button */}
        <button
          className="smartick-results-screen__back-button"
          onClick={onGoHome}
          type="button"
        >
          Volver
        </button>
      </div>
    </div>
  );
};

export default ResultsScreen;
