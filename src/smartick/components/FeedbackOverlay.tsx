/**
 * FeedbackOverlay — Answer feedback overlay.
 *
 * Shows a context-appropriate message after the user submits an answer.
 * Types:
 *   - correct: green overlay, brief, auto-fades (handled by parent timer)
 *   - incorrect: gentle orange, shows the correct answer, auto-fades
 *   - streak: special popup with animation for milestone streaks
 *   - milestone: celebration message (badge earned, session complete)
 *
 * Uses the Spanish message pools from the scoring engine.
 *
 * @module components/FeedbackOverlay
 */

import React from "react";
import MiniConfetti from "./MiniConfetti";
import MonsterDisplay from "./MonsterDisplay";
import type { MonsterState } from "./MonsterDisplay";

export interface FeedbackOverlayProps {
  /** The feedback message to display. */
  message: string;
  /** The type of feedback (determines styling). */
  type: "correct" | "incorrect" | "streak" | "milestone" | null;
  /** Kept for interface compat — no longer shown. */
  correctAnswer?: number;
}

const FeedbackOverlay: React.FC<FeedbackOverlayProps> = ({
  message,
  type,
  correctAnswer,
}) => {
  if (!type || !message) return null;

  const className = [
    "smartick-feedback-overlay",
    `smartick-feedback-overlay--${type}`,
  ].join(" ");

  // Derive monster state from feedback type
  const monsterState: MonsterState =
    type === "correct"
      ? "happy"
      : type === "incorrect"
        ? "sad"
        : "celebration"; // streak or milestone

  return (
    <div className={className} role="alert" aria-live="assertive">
      <MiniConfetti play={type === "correct"} />
      <div className="smartick-feedback-overlay__content">
        <div style={{ marginBottom: "1rem" }}>
          <MonsterDisplay state={monsterState} size="medium" />
        </div>
        <p className="smartick-feedback-overlay__message">{message}</p>

        {type === "incorrect" && (
          <p className="smartick-feedback-overlay__hint">
            ¡Seguí intentando!
          </p>
        )}
      </div>
    </div>
  );
};

export default FeedbackOverlay;
