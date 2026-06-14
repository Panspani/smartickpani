/**
 * SmartickApp — Root component: view router + Provider.
 *
 * Uses useReducer for state-based navigation between 5 views:
 *   'dashboard' | 'session' | 'results' | 'minigame' | 'parent'
 *
 * Mounts the appropriate screen component and wraps children with
 * access to useStorage via prop drilling.
 *
 * @module components/SmartickApp
 */

import React, { useReducer, useCallback, useRef, useState } from "react";
import type { Problem, View } from "../engine/types";
import { VIEWS } from "../engine/types";
import { createAudioContext, isAudioInitialized } from "../audio/sounds";
import StartScreen from "./StartScreen";
import SessionScreen from "./SessionScreen";
import ResultsScreen from "./ResultsScreen";
import CorrectionPhase from "./CorrectionPhase";
import MiniGameScreen from "./MiniGameScreen";
import ChildDashboard from "./ChildDashboard";
import ParentGate from "./ParentGate";
import ParentView from "./ParentView";
import OnboardingCarousel from "./OnboardingCarousel";

// ──────────────────────────────────────────────
// State & Actions
// ──────────────────────────────────────────────

interface AppState {
  view: View;
  /** Session result ID to pass from session → results */
  sessionResultId: string | null;
}

type AppAction =
  | { type: "NAVIGATE"; view: View }
  | { type: "SESSION_COMPLETE"; sessionResultId: string }
  | { type: "GO_HOME" };

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "NAVIGATE":
      return { ...state, view: action.view };
    case "SESSION_COMPLETE":
      return {
        ...state,
        view: VIEWS.RESULTS,
        sessionResultId: action.sessionResultId,
      };
    case "GO_HOME":
      return { view: VIEWS.HOME, sessionResultId: null };
    default:
      return state;
  }
}

// ──────────────────────────────────────────────
// Helper: random addition problem for ParentGate
// ──────────────────────────────────────────────

function generateGateChallenge(): { a: number; b: number } {
  const a = Math.floor(Math.random() * 18) + 3; // 3–20
  const b = Math.floor(Math.random() * 18) + 3; // 3–20
  return { a, b };
}

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

const SmartickApp: React.FC = () => {
  const [state, dispatch] = useReducer(appReducer, {
    view: VIEWS.HOME,
    sessionResultId: null,
  });

  // ── Onboarding gate ───────────────────────────
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    return localStorage.getItem("smartick.onboardingDone") !== "true";
  });

  const handleOnboardingComplete = useCallback(() => {
    setShowOnboarding(false);
  }, []);

  // ── Parent gate ───────────────────────────────

  const [gateChallenge, setGateChallenge] = useState<{
    a: number;
    b: number;
  } | null>(null);
  const gateChallengeRef = useRef<{ a: number; b: number } | null>(null);

  // ── Navigation callbacks ──────────────────────

  const goToSession = useCallback(() => {
    // Initialize AudioContext on user gesture
    if (!isAudioInitialized()) {
      createAudioContext();
    }
    dispatch({ type: "NAVIGATE", view: VIEWS.SESSION });
  }, []);

  const handleSessionComplete = useCallback(
    (sessionResultId: string) => {
      dispatch({ type: "SESSION_COMPLETE", sessionResultId });
    },
    [],
  );

  const goHome = useCallback(() => {
    setCorrectionProblems([]);
    setSessionStars(0);
    dispatch({ type: "GO_HOME" });
  }, []);

  const goToParent = useCallback(() => {
    const challenge = generateGateChallenge();
    gateChallengeRef.current = challenge;
    setGateChallenge(challenge);
  }, []);

  const handleParentGatePass = useCallback(() => {
    setGateChallenge(null);
    gateChallengeRef.current = null;
    dispatch({ type: "NAVIGATE", view: VIEWS.PARENT });
  }, []);

  const handleParentGateCancel = useCallback(() => {
    setGateChallenge(null);
    gateChallengeRef.current = null;
  }, []);

  const goToDashboard = useCallback(() => {
    dispatch({ type: "NAVIGATE", view: VIEWS.HOME });
  }, []);

  // ── Correction state ──────────────────────────

  const [correctionProblems, setCorrectionProblems] = useState<Problem[]>([]);
  const [sessionStars, setSessionStars] = useState(0);

  // ── Minigame handlers ─────────────────────────

  const handleMinigameSkip = useCallback(() => {
    dispatch({ type: "GO_HOME" });
  }, []);

  const handleMinigameWin = useCallback(
    (_starsToAdd: number) => {
      // Las estrellas bonus son un premio visual de la sesión,
      // no se persisten en localStorage (bonus no permanente).
      dispatch({ type: "GO_HOME" });
    },
    [],
  );

  const goToMinigame = useCallback(() => {
    dispatch({ type: "NAVIGATE", view: VIEWS.MINIGAME });
  }, []);

  // ── Correction handlers ───────────────────────

  const handleCorrection = useCallback(
    (problems: Problem[], stars: number) => {
      setCorrectionProblems(problems);
      setSessionStars(stars);
      dispatch({ type: "NAVIGATE", view: VIEWS.CORRECTION });
    },
    [],
  );

  const handleCorrectionComplete = useCallback(
    (_extraStars: number) => {
      // Extra stars from correction are a visual bonus — not persisted.
      // Navigate to mini-game after correction.
      dispatch({ type: "NAVIGATE", view: VIEWS.MINIGAME });
    },
    [],
  );

  const handleCorrectionSkip = useCallback(() => {
    dispatch({ type: "NAVIGATE", view: VIEWS.MINIGAME });
  }, []);

  // ── Render current view ───────────────────────

  const renderView = (): React.ReactNode => {
    switch (state.view) {
      case VIEWS.HOME:
        return (
          <ChildDashboard
            onStart={goToSession}
            onParentGate={goToParent}
          />
        );

      case VIEWS.SESSION:
        return (
          <SessionScreen
            onSessionComplete={handleSessionComplete}
          />
        );

      case VIEWS.RESULTS:
        return (
          <ResultsScreen
            sessionResultId={state.sessionResultId}
            onGoHome={goHome}
            onPlayGame={goToMinigame}
            onCorrection={handleCorrection}
          />
        );

      case VIEWS.CORRECTION:
        return (
          <CorrectionPhase
            problems={correctionProblems}
            existingStars={sessionStars}
            onComplete={handleCorrectionComplete}
            onSkip={handleCorrectionSkip}
          />
        );

      case VIEWS.MINIGAME:
        return (
          <MiniGameScreen
            onWin={handleMinigameWin}
            onSkip={handleMinigameSkip}
          />
        );

      case VIEWS.PARENT:
        return <ParentView onBack={goToDashboard} />;

      default:
        return <ChildDashboard onStart={goToSession} onParentGate={goToParent} />;
    }
  };

  // ── Onboarding takes priority over all views ──
  if (showOnboarding) {
    return (
      <OnboardingCarousel onComplete={handleOnboardingComplete} />
    );
  }

  return (
    <div className="smartick-app">
      {renderView()}

      {/* ParentGate modal — rendered overlay on any view */}
      {gateChallenge && (
        <ParentGate
          a={gateChallenge.a}
          b={gateChallenge.b}
          onCorrect={handleParentGatePass}
          onCancel={handleParentGateCancel}
        />
      )}
    </div>
  );
};

export default SmartickApp;
