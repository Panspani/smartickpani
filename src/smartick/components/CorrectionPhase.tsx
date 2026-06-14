/**
 * CorrectionPhase — Post-session review of incorrect problems.
 *
 * Presents each incorrect problem for a single retry attempt.
 * Correct retries award +1⭐. After all problems, shows a summary
 * of extra stars earned.
 *
 * Frame: "¡Ahora podés ganar más estrellas!" — positive, encouraging.
 * Does NOT affect adaptive engine, skill progress, or badge criteria.
 *
 * @module components/CorrectionPhase
 */

import React, { useState, useCallback, useRef, useEffect } from "react";
import type { Problem } from "../engine/types";
import ProblemView from "./ProblemView";
import MonsterDisplay from "./MonsterDisplay";
import type { MonsterState } from "./MonsterDisplay";

export interface CorrectionPhaseProps {
  /** Incorrect problems from the session, to retry one by one. */
  problems: Problem[];
  /** Stars earned during the session (for display only). */
  existingStars: number;
  /** Called when all corrections are done, with the count of extra stars earned. */
  onComplete: (extraStars: number) => void;
  /** Called when the user skips correction entirely. */
  onSkip: () => void;
}

type CorrectionPhaseState = "playing" | "feedback" | "summary";

const FEEDBACK_CORRECT_MS = 1500;
const FEEDBACK_INCORRECT_MS = 2000;

const CorrectionPhase: React.FC<CorrectionPhaseProps> = ({
  problems,
  existingStars,
  onComplete,
  onSkip,
}) => {
  const [index, setIndex] = useState(0);
  const [extraStars, setExtraStars] = useState(0);
  const [phase, setPhase] = useState<CorrectionPhaseState>("playing");
  const [feedbackType, setFeedbackType] = useState<"correct" | "incorrect" | null>(null);
  const [monsterState, setMonsterState] = useState<MonsterState>("idle");
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalProblems = problems.length;
  const currentProblem = problems[index];
  const isLastProblem = index >= totalProblems - 1;

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (advanceTimerRef.current) {
        clearTimeout(advanceTimerRef.current);
      }
    };
  }, []);

  // ── Handle answer ──────────────────────────────
  const handleAnswer = useCallback(
    (answer: number) => {
      if (phase !== "playing" || !currentProblem) return;

      const isCorrect = answer === currentProblem.answer;

      if (isCorrect) {
        setExtraStars((s) => s + 1);
        setFeedbackType("correct");
        setMonsterState("happy");
      } else {
        setFeedbackType("incorrect");
        setMonsterState("sad");
      }

      setPhase("feedback");

      const delay = isCorrect ? FEEDBACK_CORRECT_MS : FEEDBACK_INCORRECT_MS;
      advanceTimerRef.current = setTimeout(() => {
        if (isLastProblem) {
          setPhase("summary");
          setMonsterState("celebration");
        } else {
          setIndex((i) => i + 1);
          setPhase("playing");
          setFeedbackType(null);
          setMonsterState("idle");
        }
        advanceTimerRef.current = null;
      }, delay);
    },
    [currentProblem, phase, isLastProblem],
  );

  // ── Skip button handler ─────────────────────────
  const handleSkip = useCallback(() => {
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
    onSkip();
  }, [onSkip]);

  // ── Empty problems edge case ────────────────────
  if (totalProblems === 0) {
    return null;
  }

  // ── Summary screen ──────────────────────────────
  if (phase === "summary") {
    return (
      <div className="smartick-correction-phase">
        <div className="smartick-correction-phase__summary">
          <div className="smartick-correction-phase__summary-mascot">
            <MonsterDisplay state="celebration" size="large" />
          </div>

          <h2 className="smartick-correction-phase__summary-title">
            {extraStars > 0
              ? `¡Ganaste ${extraStars} estrella${extraStars !== 1 ? "s" : ""} extra!`
              : "¡Buen intento!"}
          </h2>

          <p className="smartick-correction-phase__summary-subtitle">
            {extraStars > 0
              ? `Ahora tenés ${existingStars + extraStars} estrellas en total`
              : "La práctica hace al maestro"}
          </p>

          {/* Extra star counter animation */}
          {extraStars > 0 && (
            <div className="smartick-correction-phase__summary-stars">
              {Array.from({ length: extraStars }, (_, i) => (
                <span
                  key={i}
                  className="smartick-correction-phase__star-earned"
                  style={{ animationDelay: `${i * 0.15}s` }}
                >
                  ⭐
                </span>
              ))}
            </div>
          )}

          <button
            className="smartick-correction-phase__continue-button"
            onClick={() => onComplete(extraStars)}
            type="button"
          >
            Continuar
          </button>
        </div>
      </div>
    );
  }

  // ── Playing / Feedback screen ────────────────────
  return (
    <div className="smartick-correction-phase">
      {/* Header */}
      <div className="smartick-correction-phase__header">
        <div className="smartick-correction-phase__header-top">
          <h2 className="smartick-correction-phase__title">
            ¡Ahora podés ganar más estrellas!
          </h2>
          <button
            className="smartick-correction-phase__skip-button"
            onClick={handleSkip}
            type="button"
            aria-label="Saltear corrección"
          >
            ✕
          </button>
        </div>

        {/* Progress */}
        <div className="smartick-correction-phase__progress">
          <span className="smartick-correction-phase__progress-text">
            {index + 1} de {totalProblems}
          </span>
          <div className="smartick-correction-phase__progress-bar">
            <div
              className="smartick-correction-phase__progress-fill"
              style={{ width: `${((index + 1) / totalProblems) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stars counter */}
      <div className="smartick-correction-phase__stars-bar">
        <span className="smartick-correction-phase__stars-label">
          Estrellas extra:
        </span>
        <span className="smartick-correction-phase__stars-count">
          {extraStars > 0 ? `⭐ ${extraStars}` : "0"}
        </span>
      </div>

      {/* Monster display */}
      <div className="smartick-correction-phase__mascot">
        <MonsterDisplay state={monsterState} size="medium" />
      </div>

      {/* Problem area */}
      <div className="smartick-correction-phase__problem">
        {currentProblem && (
          <ProblemView
            key={`correction-${currentProblem.id}`}
            problem={currentProblem}
            onAnswer={handleAnswer}
            disabled={phase !== "playing"}
          />
        )}
      </div>

      {/* Feedback overlay */}
      {phase === "feedback" && feedbackType && (
        <div
          className={`smartick-correction-phase__feedback smartick-correction-phase__feedback--${feedbackType}`}
        >
          {feedbackType === "correct" ? (
            <span className="smartick-correction-phase__feedback-text">
              ¡Correcto!{" "}
              <span className="smartick-correction-phase__feedback-star">
                +1 ⭐
              </span>
            </span>
          ) : (
            <span className="smartick-correction-phase__feedback-text">
              La respuesta correcta era{" "}
              <strong className="smartick-correction-phase__correct-answer">
                {currentProblem?.answer}
              </strong>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default CorrectionPhase;
