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

export interface FeedbackOverlayProps {
  /** The feedback message to display. */
  message: string;
  /** The type of feedback (determines styling). */
  type: "correct" | "incorrect" | "streak" | "milestone" | null;
  /** The correct answer (only shown for incorrect feedback). */
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

  return (
    <div className={className} role="alert" aria-live="assertive">
      <div className="smartick-feedback-overlay__content">
        <p className="smartick-feedback-overlay__message">{message}</p>

        {type === "incorrect" && correctAnswer !== undefined && (
          <p className="smartick-feedback-overlay__correct-answer">
            La respuesta correcta era:{" "}
            <strong>{correctAnswer}</strong>
          </p>
        )}
      </div>
    </div>
  );
};

export default FeedbackOverlay;
