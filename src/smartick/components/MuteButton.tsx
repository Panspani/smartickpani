/**
 * MuteButton — Speaker mute/unmute toggle button.
 *
 * Displays a speaker icon that changes between on/off states.
 * Intended for the SessionScreen top bar — compact (36×36px).
 *
 * @module components/MuteButton
 */

import React from "react";

export interface MuteButtonProps {
  /** Whether audio is currently muted. */
  isMuted: boolean;
  /** Callback to toggle mute state. */
  onToggle: () => void;
}

const MuteButton: React.FC<MuteButtonProps> = ({ isMuted, onToggle }) => {
  return (
    <button
      className="smartick-mute-button"
      onClick={onToggle}
      type="button"
      aria-label={isMuted ? "Activar sonido" : "Silenciar"}
      title={isMuted ? "Activar sonido" : "Silenciar"}
    >
      <svg
        className="smartick-mute-button__icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {isMuted ? (
          <>
            {/* Speaker off — crossed out */}
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </>
        ) : (
          <>
            {/* Speaker on — with sound waves */}
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          </>
        )}
      </svg>
    </button>
  );
};

export default MuteButton;
