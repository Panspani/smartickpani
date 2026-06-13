/**
 * SessionScreen — Active session view.
 *
 * Orchestrates the live session experience using useSession hook.
 * Shows: TimerDisplay + StarCounter + ProblemView + FeedbackOverlay.
 * Manages feedback auto-fade timing and session completion detection.
 *
 * @module components/SessionScreen
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "../hooks/useSession";
import TimerDisplay from "./TimerDisplay";
import StarCounter from "./StarCounter";
import ProblemView from "./ProblemView";
import FeedbackOverlay from "./FeedbackOverlay";

export interface SessionScreenProps {
  onSessionComplete: (sessionResultId: string) => void;
}

/** Duration (ms) to show feedback before allowing the next answer. */
const FEEDBACK_CORRECT_MS = 1500;
const FEEDBACK_INCORRECT_MS = 2000;

const SessionScreen: React.FC<SessionScreenProps> = ({ onSessionComplete }) => {
  const session = useSession();
  const completedRef = useRef(false);
  const [visibleFeedback, setVisibleFeedback] = useState<{
    message: string;
    type: "correct" | "incorrect" | "streak" | "milestone";
    correctAnswer?: number;
  } | null>(null);
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-start session on mount
  useEffect(() => {
    session.startSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Feedback fade management ──────────────────

  useEffect(() => {
    if (session.feedbackMessage && session.feedbackType) {
      // Clear any existing fade timer
      if (fadeTimerRef.current) {
        clearTimeout(fadeTimerRef.current);
      }

      const correctAnswer =
        session.feedbackType === "incorrect" && session.currentProblem
          ? session.currentProblem.answer
          : undefined;

      setVisibleFeedback({
        message: session.feedbackMessage,
        type: session.feedbackType,
        correctAnswer,
      });

      const duration =
        session.feedbackType === "incorrect"
          ? FEEDBACK_INCORRECT_MS
          : FEEDBACK_CORRECT_MS;

      fadeTimerRef.current = setTimeout(() => {
        setVisibleFeedback(null);
        fadeTimerRef.current = null;
      }, duration);
    }

    return () => {
      if (fadeTimerRef.current) {
        clearTimeout(fadeTimerRef.current);
        fadeTimerRef.current = null;
      }
    };
  }, [session.feedbackMessage, session.feedbackType, session.currentProblem]);

  // ── Watch for session completion ──────────────

  useEffect(() => {
    if (
      session.isSessionComplete &&
      session.sessionResult &&
      !completedRef.current
    ) {
      completedRef.current = true;
      const id = session.sessionResult.id;
      // Small delay to let the UI show the final state
      const timer = setTimeout(() => {
        onSessionComplete(id);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [session.isSessionComplete, session.sessionResult, onSessionComplete]);

  // ── Answer handler ────────────────────────────

  const handleAnswer = useCallback(
    (answer: number) => {
      if (visibleFeedback) return; // Ignore input during feedback
      session.submitAnswer(answer);
    },
    [session, visibleFeedback],
  );

  const isProblemDisabled = visibleFeedback !== null;

  return (
    <div className="smartick-session-screen">
      {/* Top bar: timer + stars */}
      <div className="smartick-session-screen__top-bar">
        <TimerDisplay seconds={session.remaining} />
        <StarCounter stars={session.stars} streak={session.streak} />
      </div>

      {/* Problem area */}
      <div className="smartick-session-screen__problem-area">
        {session.currentProblem && (
          <ProblemView
            key={session.currentProblem.id}
            problem={session.currentProblem}
            onAnswer={handleAnswer}
            disabled={isProblemDisabled}
          />
        )}
      </div>

      {/* Feedback overlay */}
      {visibleFeedback && (
        <FeedbackOverlay
          message={visibleFeedback.message}
          type={visibleFeedback.type}
          correctAnswer={visibleFeedback.correctAnswer}
        />
      )}
    </div>
  );
};

export default SessionScreen;
