/**
 * RelojGame — Leer y ajustar la hora en un reloj analógico.
 *
 * Dos modos alternados:
 *   Modo Ajustar: se muestra hora digital, el usuario mueve las agujas
 *   Modo Leer: se muestra el reloj analógico, elige la hora digital
 *
 * 3 rondas progresivas.
 *
 * @module components/RelojGame
 */

import React, { useState, useCallback } from "react";

export interface RelojGameProps {
  onWin: (starsToAdd: number) => void;
  onSkip: () => void;
}

type GameMode = "ajustar" | "leer";

interface TimeTarget {
  hour: number; // 1–12
  minute: number; // 0, 15, 30, 45
}

function generateTime(round: number): TimeTarget {
  const hour = 1 + Math.floor(Math.random() * 12);
  if (round === 0) {
    const increments = [0, 30];
    return { hour, minute: increments[Math.floor(Math.random() * increments.length)] };
  }
  if (round === 1) {
    const increments = [0, 15, 30];
    return { hour, minute: increments[Math.floor(Math.random() * increments.length)] };
  }
  const increments = [0, 15, 30, 45];
  return { hour, minute: increments[Math.floor(Math.random() * increments.length)] };
}

function formatTime(hour: number, minute: number): string {
  return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
}

function hourAngle(hour: number, minute: number): number {
  return ((hour % 12) * 30 + minute * 0.5) % 360;
}

function minuteAngle(minute: number): number {
  return (minute * 6) % 360;
}

/** Generate 3 wrong options for the "leer" mode. */
function generateOptions(target: TimeTarget): TimeTarget[] {
  const options: TimeTarget[] = [target];
  const used = new Set([`${target.hour}-${target.minute}`]);
  while (options.length < 4) {
    const h = 1 + Math.floor(Math.random() * 12);
    const increments = [0, 15, 30, 45];
    const m = increments[Math.floor(Math.random() * increments.length)];
    const key = `${h}-${m}`;
    if (!used.has(key)) {
      used.add(key);
      options.push({ hour: h, minute: m });
    }
  }
  // Shuffle
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  return options;
}

// ── Component ────────────────────────────────────

const RelojGame: React.FC<RelojGameProps> = ({ onWin, onSkip }) => {
  const [mode] = useState<GameMode>(() => (Math.random() < 0.5 ? "ajustar" : "leer"));
  const [round, setRound] = useState(0);
  const [target, setTarget] = useState(() => generateTime(0));
  const [currentHour, setCurrentHour] = useState(12);
  const [currentMinute, setCurrentMinute] = useState(0);
  const [won, setWon] = useState(false);
  const [roundWon, setRoundWon] = useState(false);

  // For "leer" mode
  const [options] = useState(() => generateOptions(target));
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const advanceRound = useCallback(() => {
    if (round >= 2) {
      setWon(true);
      setTimeout(() => onWin(1), 1000);
    } else {
      const nextRound = round + 1;
      setRound(nextRound);
      const newTarget = generateTime(nextRound);
      setTarget(newTarget);
      setCurrentHour(12);
      setCurrentMinute(0);
      setSelectedOption(null);
      setRoundWon(false);
    }
  }, [round, onWin]);

  const handleRoundWin = useCallback(() => {
    setRoundWon(true);
    setTimeout(advanceRound, 1200);
  }, [advanceRound]);

  // Mode: AJUSTAR (set hands to match digital time)
  const adjustHour = useCallback(
    (delta: number) => {
      if (won || roundWon) return;
      const next = ((currentHour - 1 + delta + 12) % 12) + 1;
      setCurrentHour(next);
      if (next === target.hour && currentMinute === target.minute) {
        handleRoundWin();
      }
    },
    [currentHour, currentMinute, target, won, roundWon, handleRoundWin],
  );

  const adjustMinute = useCallback(
    (delta: number) => {
      if (won || roundWon) return;
      const next = ((currentMinute + delta + 60) % 60);
      setCurrentMinute(next);
      if (currentHour === target.hour && next === target.minute) {
        handleRoundWin();
      }
    },
    [currentHour, currentMinute, target, won, roundWon, handleRoundWin],
  );

  // Mode: LEER (read the clock, pick digital time)
  const handleOptionSelect = useCallback(
    (index: number) => {
      if (won || roundWon) return;
      setSelectedOption(index);
      if (options[index].hour === target.hour && options[index].minute === target.minute) {
        handleRoundWin();
      }
    },
    [options, target, won, roundWon, handleRoundWin],
  );

  const hAngle = hourAngle(
    mode === "leer" ? target.hour : currentHour,
    mode === "leer" ? target.minute : currentMinute,
  );
  const mAngle = minuteAngle(mode === "leer" ? target.minute : currentMinute);

  // ── Render ──────────────────────────────────────

  const clockFace = (
    <div className="smartick-reloj__face">
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i * 30 - 90) * (Math.PI / 180);
        const r = 38;
        return (
          <span
            key={i}
            className="smartick-reloj__number"
            style={{ left: `${50 + r * Math.cos(angle)}%`, top: `${50 + r * Math.sin(angle)}%` }}
          >
            {i === 0 ? 12 : i}
          </span>
        );
      })}
      <div className="smartick-reloj__hand smartick-reloj__hand--hour" style={{ transform: `rotate(${hAngle}deg)` }} />
      <div className="smartick-reloj__hand smartick-reloj__hand--minute" style={{ transform: `rotate(${mAngle}deg)` }} />
      <div className="smartick-reloj__center" />
    </div>
  );

  return (
    <div className="smartick-reloj">
      <div className="smartick-reloj__header">
        <h2 className="smartick-reloj__title">
          {mode === "ajustar" ? "🕐 Ajustá las agujas" : "👀 Leé la hora"}
        </h2>
        {!won && (
          <button className="smartick-reloj__skip" onClick={onSkip} type="button">✕</button>
        )}
      </div>

      <div className="smartick-balanza__rounds">
        {[0, 1, 2].map((r) => (
          <span key={r} className={`smartick-balanza__round-dot ${r < round ? "smartick-balanza__round-dot--done" : ""} ${r === round ? "smartick-balanza__round-dot--active" : ""}`}>
            {r + 1}
          </span>
        ))}
      </div>

      {mode === "ajustar" ? (
        <>
          <p className="smartick-reloj__target">
            Marcá las <strong>{formatTime(target.hour, target.minute)}</strong>
          </p>

          {clockFace}

          <div className="smartick-reloj__digital">{formatTime(currentHour, currentMinute)}</div>

          <div className="smartick-reloj__status">
            {won ? (
              <span className="smartick-reloj__win">🎉 ¡Completaste! +1 ⭐</span>
            ) : roundWon ? (
              <span className="smartick-reloj__match">✓ ¡Bien!</span>
            ) : (
              <span className="smartick-reloj__hint">Ajustá las agujas</span>
            )}
          </div>

          {!won && !roundWon && (
            <div className="smartick-reloj__controls">
              <div className="smartick-reloj__control-group">
                <span className="smartick-reloj__control-label">Hora</span>
                <div className="smartick-reloj__buttons">
                  <button className="smartick-reloj__btn" onClick={() => adjustHour(-1)} type="button">◀</button>
                  <span className="smartick-reloj__value">{currentHour}</span>
                  <button className="smartick-reloj__btn" onClick={() => adjustHour(1)} type="button">▶</button>
                </div>
              </div>
              <div className="smartick-reloj__control-group">
                <span className="smartick-reloj__control-label">Minutos</span>
                <div className="smartick-reloj__buttons">
                  <button className="smartick-reloj__btn" onClick={() => adjustMinute(-5)} type="button">◀</button>
                  <span className="smartick-reloj__value">{currentMinute.toString().padStart(2, "0")}</span>
                  <button className="smartick-reloj__btn" onClick={() => adjustMinute(5)} type="button">▶</button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <p className="smartick-reloj__target">¿Qué hora es?</p>

          {clockFace}

          <div className="smartick-reloj__status">
            {won ? (
              <span className="smartick-reloj__win">🎉 ¡Completaste! +1 ⭐</span>
            ) : roundWon ? (
              <span className="smartick-reloj__match">✓ ¡Correcto!</span>
            ) : selectedOption !== null ? (
              <span className="smartick-reloj__hint">❌ No, intentá de nuevo</span>
            ) : (
              <span className="smartick-reloj__hint">Elegí la hora correcta</span>
            )}
          </div>

          {!won && !roundWon && (
            <div className="smartick-reloj__options">
              {options.map((opt, i) => {
                const isSelected = selectedOption === i;
                const isCorrect =
                  isSelected && opt.hour === target.hour && opt.minute === target.minute;
                return (
                  <button
                    key={i}
                    className={`smartick-reloj__option-btn ${
                      isCorrect
                        ? "smartick-reloj__option-btn--correct"
                        : isSelected
                          ? "smartick-reloj__option-btn--wrong"
                          : ""
                    }`}
                    onClick={() => handleOptionSelect(i)}
                    type="button"
                  >
                    {formatTime(opt.hour, opt.minute)}
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RelojGame;
