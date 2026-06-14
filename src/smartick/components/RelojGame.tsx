/**
 * RelojGame — Mover las agujas a la hora indicada.
 *
 * Se muestra una hora digital (ej: "3:45"). El usuario mueve la aguja
 * horaria y minutera con botones + / - hasta que coincidan.
 * Cuando coincide exactamente, gana.
 *
 * @module components/RelojGame
 */

import React, { useState, useCallback, useMemo } from "react";

export interface RelojGameProps {
  onWin: (starsToAdd: number) => void;
  onSkip: () => void;
}

// ── Helpers ──────────────────────────────────────

function randomTime(): { hour: number; minute: number } {
  const hour = 1 + Math.floor(Math.random() * 12); // 1–12
  const increments = [0, 15, 30, 45];
  const minute = increments[Math.floor(Math.random() * increments.length)];
  return { hour, minute };
}

function formatTime(hour: number, minute: number): string {
  const h = hour.toString().padStart(2, "0");
  const m = minute.toString().padStart(2, "0");
  return `${h}:${m}`;
}

/** Angle in degrees for the hour hand. */
function hourAngle(hour: number, minute: number): number {
  return ((hour % 12) * 30 + minute * 0.5) % 360;
}

/** Angle in degrees for the minute hand. */
function minuteAngle(minute: number): number {
  return (minute * 6) % 360;
}

// ── Component ────────────────────────────────────

const RelojGame: React.FC<RelojGameProps> = ({ onWin, onSkip }) => {
  const [target] = useState(randomTime);
  const [currentHour, setCurrentHour] = useState(12);
  const [currentMinute, setCurrentMinute] = useState(0);
  const [won, setWon] = useState(false);

  const isMatch =
    currentHour === target.hour && currentMinute === target.minute;

  const handleWon = useCallback(() => {
    if (won) return;
    setWon(true);
    setTimeout(() => onWin(1), 800);
  }, [won, onWin]);

  // Auto-detect win when hands match
  const prevMatch = useMemo(() => isMatch, [isMatch]);
  // This effect is handled via the isMatch check below

  const adjustHour = useCallback(
    (delta: number) => {
      if (won) return;
      const next = ((currentHour - 1 + delta + 12) % 12) + 1;
      setCurrentHour(next);
      if (next === target.hour && currentMinute === target.minute) {
        handleWon();
      }
    },
    [currentHour, currentMinute, target, won, handleWon],
  );

  const adjustMinute = useCallback(
    (delta: number) => {
      if (won) return;
      const next = ((currentMinute + delta + 60) % 60);
      setCurrentMinute(next);
      if (currentHour === target.hour && next === target.minute) {
        handleWon();
      }
    },
    [currentHour, currentMinute, target, won, handleWon],
  );

  const hAngle = hourAngle(currentHour, currentMinute);
  const mAngle = minuteAngle(currentMinute);

  return (
    <div className="smartick-reloj">
      <div className="smartick-reloj__header">
        <h2 className="smartick-reloj__title">🕐 Poné las agujas en hora</h2>
        {!won && (
          <button
            className="smartick-reloj__skip"
            onClick={onSkip}
            type="button"
            aria-label="Saltar"
          >
            ✕
          </button>
        )}
      </div>

      <p className="smartick-reloj__target">
        Marcá las <strong>{formatTime(target.hour, target.minute)}</strong>
      </p>

      {/* ── Clock face ──────────────────────────── */}
      <div className="smartick-reloj__face">
        {/* Hour numbers */}
        {Array.from({ length: 12 }, (_, i) => {
          const angle = (i * 30 - 90) * (Math.PI / 180);
          const radius = 38;
          const x = 50 + radius * Math.cos(angle);
          const y = 50 + radius * Math.sin(angle);
          return (
            <span
              key={i}
              className="smartick-reloj__number"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              {i === 0 ? 12 : i}
            </span>
          );
        })}

        {/* Hour hand */}
        <div
          className="smartick-reloj__hand smartick-reloj__hand--hour"
          style={{ transform: `rotate(${hAngle}deg)` }}
        />

        {/* Minute hand */}
        <div
          className="smartick-reloj__hand smartick-reloj__hand--minute"
          style={{ transform: `rotate(${mAngle}deg)` }}
        />

        {/* Centre dot */}
        <div className="smartick-reloj__center" />
      </div>

      {/* ── Current display ─────────────────────── */}
      <div className="smartick-reloj__digital">
        {formatTime(currentHour, currentMinute)}
      </div>

      {/* ── Status ──────────────────────────────── */}
      <div className="smartick-reloj__status">
        {won ? (
          <span className="smartick-reloj__win">🎉 ¡Hora correcta! +1 ⭐</span>
        ) : isMatch ? (
          <span className="smartick-reloj__match">✓ ¡Exacto!</span>
        ) : (
          <span className="smartick-reloj__hint">Ajustá las agujas</span>
        )}
      </div>

      {/* ── Controls ────────────────────────────── */}
      {!won && (
        <div className="smartick-reloj__controls">
          <div className="smartick-reloj__control-group">
            <span className="smartick-reloj__control-label">Hora</span>
            <div className="smartick-reloj__buttons">
              <button
                className="smartick-reloj__btn"
                onClick={() => adjustHour(-1)}
                type="button"
                aria-label="Hora anterior"
              >
                ◀
              </button>
              <span className="smartick-reloj__value">{currentHour}</span>
              <button
                className="smartick-reloj__btn"
                onClick={() => adjustHour(1)}
                type="button"
                aria-label="Siguiente hora"
              >
                ▶
              </button>
            </div>
          </div>
          <div className="smartick-reloj__control-group">
            <span className="smartick-reloj__control-label">Minutos</span>
            <div className="smartick-reloj__buttons">
              <button
                className="smartick-reloj__btn"
                onClick={() => adjustMinute(-5)}
                type="button"
                aria-label="Minutos atrás"
              >
                ◀
              </button>
              <span className="smartick-reloj__value">
                {currentMinute.toString().padStart(2, "0")}
              </span>
              <button
                className="smartick-reloj__btn"
                onClick={() => adjustMinute(5)}
                type="button"
                aria-label="Minutos adelante"
              >
                ▶
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RelojGame;
