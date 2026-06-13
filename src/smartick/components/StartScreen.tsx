/**
 * StartScreen — Welcome / entry screen.
 *
 * Displays a large fun title, subtitle, and a big "¡Comenzar!" button.
 * On click: initializes AudioContext, calls the onStart callback which
 * navigates to the session view and starts a new session.
 *
 * @module components/StartScreen
 */

import React, { useCallback } from "react";
import { createAudioContext, isAudioInitialized } from "../audio/sounds";

export interface StartScreenProps {
  onStart: () => void;
  childName?: string;
}

const StartScreen: React.FC<StartScreenProps> = ({
  onStart,
  childName = "Ana",
}) => {
  const handleStart = useCallback(() => {
    // Satisfy browser autoplay policies: AudioContext must be created
    // inside a user gesture handler.
    if (!isAudioInitialized()) {
      createAudioContext();
    }
    onStart();
  }, [onStart]);

  return (
    <div className="smartick-start-screen">
      <div className="smartick-start-screen__content">
        <h1 className="smartick-start-screen__title">¡MateSmart!</h1>

        <p className="smartick-start-screen__subtitle">
          Matemáticas adaptativas para {childName}
        </p>

        <button
          className="smartick-start-screen__button"
          onClick={handleStart}
          type="button"
          aria-label="Comenzar sesión de matemáticas"
        >
          ¡Comenzar!
        </button>
      </div>
    </div>
  );
};

export default StartScreen;
