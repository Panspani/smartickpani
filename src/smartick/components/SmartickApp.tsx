/**
 * SmartickApp — Root component: view router + Provider.
 *
 * Uses useReducer for state-based navigation between 4 views:
 *   'dashboard' | 'session' | 'results' | 'parent'
 *
 * Mounts the appropriate screen component and wraps children with
 * access to useStorage via prop drilling.
 *
 * @module components/SmartickApp
 */

import React, { useReducer, useCallback, useRef } from "react";
import type { View } from "../engine/types";
import { VIEWS } from "../engine/types";
import { createAudioContext, isAudioInitialized } from "../audio/sounds";
import StartScreen from "./StartScreen";
import SessionScreen from "./SessionScreen";
import ResultsScreen from "./ResultsScreen";
import ChildDashboard from "./ChildDashboard";
import ParentGate from "./ParentGate";
import ParentView from "./ParentView";

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

  const [gateChallenge, setGateChallenge] = React.useState<{
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
          />
        );

      case VIEWS.PARENT:
        return <ParentView onBack={goToDashboard} />;

      default:
        return <ChildDashboard onStart={goToSession} onParentGate={goToParent} />;
    }
  };

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
