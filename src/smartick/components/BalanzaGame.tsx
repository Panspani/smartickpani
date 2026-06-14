/**
 * BalanzaGame — Equilibrar una balanza con pesas (masa: g / kg).
 *
 * 3 rondas progresivas de dificultad creciente.
 *
 * @module components/BalanzaGame
 */

import React, { useState, useMemo, useCallback } from "react";

export interface BalanzaGameProps {
  onWin: (starsToAdd: number) => void;
  onSkip: () => void;
}

const WEIGHTS_G = [10, 50, 100, 200, 500];
const WEIGHTS_KG = [1, 2, 5];
const TOLERANCE = 0.05;

interface RoundTarget {
  value: number;
  unit: "g" | "kg";
}

function generateTarget(round: number): RoundTarget {
  if (round === 0) {
    // Easy: round gramos
    const v = Math.round((50 + Math.random() * 450) / 10) * 10;
    return { value: Math.max(10, v), unit: "g" };
  }
  if (round === 1) {
    // Medium: mixed
    if (Math.random() < 0.5) {
      const v = Math.round((200 + Math.random() * 800) / 10) * 10;
      return { value: Math.max(10, v), unit: "g" };
    }
    return { value: 1 + Math.floor(Math.random() * 5), unit: "kg" };
  }
  // Hard: tricky numbers, kg with g precision
  if (Math.random() < 0.5) {
    return { value: 500 + Math.floor(Math.random() * 10) * 100, unit: "g" };
  }
  const kg = 1 + Math.floor(Math.random() * 10);
  const extra = Math.floor(Math.random() * 10) * 100 / 1000;
  return { value: kg + extra, unit: "kg" as const };
}

function formatWeight(v: number, unit: "g" | "kg"): string {
  return unit === "kg" ? `${v.toFixed(v % 1 === 0 ? 0 : 1)} kg` : `${v} g`;
}

const BalanzaGame: React.FC<BalanzaGameProps> = ({ onWin, onSkip }) => {
  const [round, setRound] = useState(0);
  const [target, setTarget] = useState(() => generateTarget(0));
  const [placedWeights, setPlacedWeights] = useState<number[]>([]);
  const [won, setWon] = useState(false);
  const [roundWon, setRoundWon] = useState(false);

  const totalPlaced = useMemo(
    () => placedWeights.reduce((sum, w) => sum + w, 0),
    [placedWeights],
  );

  const targetInGrams = target.unit === "kg" ? target.value * 1000 : target.value;

  const handleAddWeight = useCallback(
    (weight: number) => {
      if (won || roundWon) return;
      const newPlaced = [...placedWeights, weight];
      setPlacedWeights(newPlaced);

      const newTotal = newPlaced.reduce((s, w) => s + w, 0);
      if (Math.abs(newTotal - targetInGrams) <= targetInGrams * TOLERANCE) {
        setRoundWon(true);
        setTimeout(() => {
          if (round >= 2) {
            setWon(true);
            setTimeout(() => onWin(1), 1000);
          } else {
            setRound((r) => r + 1);
            setTarget(generateTarget(round + 1));
            setPlacedWeights([]);
            setRoundWon(false);
          }
        }, 1200);
      }
    },
    [placedWeights, targetInGrams, round, won, roundWon, onWin],
  );

  const handleClear = useCallback(() => {
    if (won || roundWon) return;
    setPlacedWeights([]);
  }, [won, roundWon]);

  const errorRatio =
    targetInGrams > 0
      ? Math.max(-1, Math.min(1, (totalPlaced - targetInGrams) / targetInGrams))
      : 0;
  const beamAngle = -errorRatio * 12;

  const availableWeights = target.unit === "kg" ? WEIGHTS_KG : WEIGHTS_G;
  const weightLabel = (w: number) =>
    target.unit === "kg" ? `${w} kg` : `${w} g`;

  return (
    <div className="smartick-balanza">
      <div className="smartick-balanza__header">
        <h2 className="smartick-balanza__title">⚖️ Equilibrá la balanza</h2>
        {!won && (
          <button className="smartick-balanza__skip" onClick={onSkip} type="button">
            ✕
          </button>
        )}
      </div>

      <div className="smartick-balanza__rounds">
        {[0, 1, 2].map((r) => (
          <span
            key={r}
            className={`smartick-balanza__round-dot ${
              r < round ? "smartick-balanza__round-dot--done" : ""
            } ${r === round ? "smartick-balanza__round-dot--active" : ""}`}
          >
            {r + 1}
          </span>
        ))}
      </div>

      <p className="smartick-balanza__target">
        Pesá <strong>{formatWeight(target.value, target.unit)}</strong>
      </p>

      <div className="smartick-balanza__scale">
        <div
          className="smartick-balanza__beam"
          style={{ transform: `rotate(${beamAngle}deg)` }}
        >
          <div className="smartick-balanza__pan smartick-balanza__pan--left">
            <span className="smartick-balanza__pan-label">?</span>
          </div>
          <div className="smartick-balanza__fulcrum" />
          <div className="smartick-balanza__pan smartick-balanza__pan--right">
            <span className="smartick-balanza__pan-label">
              {totalPlaced > 0
                ? `${totalPlaced}${target.unit === "kg" ? " g" : " g"}`
                : "0"}
            </span>
          </div>
        </div>
      </div>

      <div className="smartick-balanza__status">
        {won ? (
          <span className="smartick-balanza__win">🎉 ¡Completaste! +1 ⭐</span>
        ) : roundWon ? (
          <span className="smartick-balanza__balancing">⚖️ ¡Bien!</span>
        ) : totalPlaced > targetInGrams ? (
          <span className="smartick-balanza__over">⬇️ Te pasaste</span>
        ) : totalPlaced === 0 ? (
          <span className="smartick-balanza__hint">Agregá pesas</span>
        ) : (
          <span className="smartick-balanza__under">⬆️ Falta peso</span>
        )}
      </div>

      {!won && !roundWon && (
        <div className="smartick-balanza__weights">
          {availableWeights.map((w) => (
            <button
              key={w}
              className="smartick-balanza__weight-btn"
              onClick={() => handleAddWeight(w)}
              type="button"
            >
              {weightLabel(w)}
            </button>
          ))}
        </div>
      )}

      {!won && !roundWon && placedWeights.length > 0 && (
        <button className="smartick-balanza__clear" onClick={handleClear} type="button">
          🔄 Empezar de nuevo
        </button>
      )}
    </div>
  );
};

export default BalanzaGame;
