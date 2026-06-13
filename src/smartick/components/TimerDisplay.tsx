/**
 * TimerDisplay — Countdown timer display.
 *
 * Renders the remaining time in MM:SS format with large digits.
 * Applies a red pulsing CSS animation when remaining < 60 seconds.
 * Memoized via React.memo to avoid unnecessary re-renders on each tick.
 *
 * @module components/TimerDisplay
 */

import React from "react";

export interface TimerDisplayProps {
  /** Remaining time in seconds. */
  seconds: number;
}

/**
 * Format seconds into MM:SS display string.
 */
function formatTime(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({ seconds }) => {
  const isLow = seconds > 0 && seconds < 60;
  const timeStr = formatTime(Math.max(0, seconds));

  const className = [
    "smartick-timer-display",
    isLow ? "smartick-timer-display--low" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={className} aria-label={`Tiempo restante: ${timeStr}`}>
      <span className="smartick-timer-display__digits">{timeStr}</span>
    </div>
  );
};

export default React.memo(TimerDisplay);
