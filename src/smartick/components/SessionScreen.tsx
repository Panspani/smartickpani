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
import { gameTypeForSubSkill, GAME_TYPES } from "../engine/gameRouter";
import type { ContextualGameType } from "../engine/gameRouter";
import TimerDisplay from "./TimerDisplay";
import StarCounter from "./StarCounter";
import ProblemView from "./ProblemView";
import VisualProblemView from "./VisualProblemView";
import FeedbackOverlay from "./FeedbackOverlay";
import MuteButton from "./MuteButton";
import MonsterDisplay from "./MonsterDisplay";
import type { MonsterState } from "./MonsterDisplay";
import type { Problem } from "../engine/types";
import BalanzaGame from "./BalanzaGame";
import BotellasGame from "./BotellasGame";
import RelojGame from "./RelojGame";
import TiendaGame from "./TiendaGame";
import MiniGameScreen from "./MiniGameScreen";

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
  const [monsterState, setMonsterState] = useState<MonsterState>("idle");

  // ── Interleaved mini-game state ───────────────

  const INTERLEAVE_EVERY = 5;
  const gamesShownRef = useRef(0);
  const [showInterleavedGame, setShowInterleavedGame] = useState(false);
  const [interleavedGameType, setInterleavedGameType] =
    useState<ContextualGameType>("memory");

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

      setVisibleFeedback({
        message: session.feedbackMessage,
        type: session.feedbackType,
        correctAnswer: undefined,
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

  // ── Interleaved mini-game trigger ─────────────
  // After feedback fades, check if 5 correct answers reached

  useEffect(() => {
    if (visibleFeedback || showInterleavedGame) return;

    const expectedGames = Math.floor(session.totalCorrect / INTERLEAVE_EVERY);
    if (expectedGames > gamesShownRef.current && session.totalCorrect > 0) {
      gamesShownRef.current = expectedGames;
      session.pauseTimer();
      const gameType = gameTypeForSubSkill(session.currentSubSkillId);
      setInterleavedGameType(gameType);
      setShowInterleavedGame(true);
    }
  }, [visibleFeedback, showInterleavedGame, session.totalCorrect, session.currentSubSkillId, session]);

  const handleInterleavedGameEnd = useCallback(() => {
    setShowInterleavedGame(false);
    session.resumeTimer();
  }, [session]);

  // ── Monster state tracking ────────────────────
  // Syncs the mascot state based on feedback type and problem state.
  useEffect(() => {
    if (visibleFeedback) {
      // Feedback is showing — set monster reaction
      switch (visibleFeedback.type) {
        case "correct":
          setMonsterState("happy");
          break;
        case "incorrect":
          setMonsterState("sad");
          break;
        case "streak":
        case "milestone":
          setMonsterState("celebration");
          break;
      }
    } else if (session.currentProblem) {
      // New problem visible — thinking briefly
      setMonsterState("thinking");
    }
  }, [visibleFeedback, session.currentProblem]);

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

  /** Render the right interleaved mini-game based on the current skill. */
  function renderInterleavedGame(
    gameType: ContextualGameType,
    recentProblems: Problem[],
    onWin: (stars: number) => void,
    onSkip: () => void,
  ): React.ReactNode {
    // If recent problems exist and game is memory, use contextual memory
    if (gameType === GAME_TYPES.MEMORY && recentProblems.length >= 2) {
      return (
        <div className="smartick-interleaved-game">
          <MiniGameScreen
            onWin={onWin}
            onSkip={onSkip}
            contextualProblems={recentProblems}
          />
        </div>
      );
    }
    // Standard game routing
    switch (gameType) {
      case GAME_TYPES.BALANZA:
        return (
          <div className="smartick-interleaved-game">
            <BalanzaGame onWin={onWin} onSkip={onSkip} />
          </div>
        );
      case GAME_TYPES.BOTELLAS:
        return (
          <div className="smartick-interleaved-game">
            <BotellasGame onWin={onWin} onSkip={onSkip} />
          </div>
        );
      case GAME_TYPES.RELOJ:
        return (
          <div className="smartick-interleaved-game">
            <RelojGame onWin={onWin} onSkip={onSkip} />
          </div>
        );
      case GAME_TYPES.TIENDA:
        return (
          <div className="smartick-interleaved-game">
            <TiendaGame onWin={onWin} onSkip={onSkip} />
          </div>
        );
      default:
        // Fallback to normal MiniGameScreen
        return (
          <div className="smartick-interleaved-game">
            <MiniGameScreen onWin={onWin} onSkip={onSkip} />
          </div>
        );
    }
  }

  return (
    <div className="smartick-session-screen">
      {/* Top bar: timer + stars */}
      <div className="smartick-session-screen__top-bar">
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <MuteButton isMuted={session.isMuted} onToggle={session.toggleMute} />
          <MonsterDisplay state={monsterState} size="small" />
          <TimerDisplay seconds={session.remaining} />
          {showInterleavedGame && (
            <span className="smartick-session-screen__paused">⏸</span>
          )}
        </div>
        <StarCounter stars={session.stars} streak={session.streak} />
      </div>

      {/* Problem area or interleaved mini-game */}
      <div className="smartick-session-screen__problem-area">
        {showInterleavedGame ? (
          renderInterleavedGame(
            interleavedGameType,
            session.recentProblems,
            handleInterleavedGameEnd,
            handleInterleavedGameEnd,
          )
        ) : (
          session.currentProblem &&
          session.currentProblem.sceneData ? (
            <VisualProblemView
              key={session.currentProblem.id}
              problem={session.currentProblem.sceneData}
              problemType={session.currentProblem.type}
              onAnswer={handleAnswer}
              disabled={isProblemDisabled}
            />
          ) : session.currentProblem ? (
            <ProblemView
              key={session.currentProblem.id}
              problem={session.currentProblem}
              onAnswer={handleAnswer}
              disabled={isProblemDisabled}
            />
          ) : null
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
