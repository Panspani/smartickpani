/**
 * BalanzaGame — Equilibrar una balanza con pesas (masa: g / kg).
 *
 * Se muestra un peso objetivo (ej: "500 g"). El usuario agrega pesas
 * de valores fijos al platillo derecho hasta igualar el objetivo.
 * Cuando la balanza se equilibra (±tolerancia), gana.
 *
 * @module components/BalanzaGame
 */

import React, { useState, useMemo, useCallback } from "react";

export interface BalanzaGameProps {
  onWin: (starsToAdd: number) => void;
  onSkip: () => void;
}

// ── Constants ────────────────────────────────────

const WEIGHTS_G = [10, 50, 100, 200, 500];
const WEIGHTS_KG = [1, 2, 5];

const TOLERANCE = 0.05; // 5%

const MIN_TARGET_G = 50;
const MAX_TARGET_G = 1500;
const MIN_TARGET_KG = 2;
const MAX_TARGET_KG = 20;

// ── Helpers ──────────────────────────────────────

function randomTarget(): { value: number; unit: "g" | "kg" } {
  // 60% chance gramos, 40% chance kilogramos
  if (Math.random() < 0.6) {
    const step = 10;
    const v =
      Math.round(
        (MIN_TARGET_G + Math.random() * (MAX_TARGET_G - MIN_TARGET_G)) / step,
      ) * step;
    return { value: v, unit: "g" };
  }
  const v =
    MIN_TARGET_KG +
    Math.floor(Math.random() * (MAX_TARGET_KG - MIN_TARGET_KG + 1));
  return { value: v, unit: "kg" };
}

// ── Component ────────────────────────────────────

const BalanzaGame: React.FC<BalanzaGameProps> = ({ onWin, onSkip }) => {
  const [target] = useState(randomTarget);
  const [placedWeights, setPlacedWeights] = useState<number[]>([]);
  const [won, setWon] = useState(false);

  const totalPlaced = useMemo(
    () => placedWeights.reduce((sum, w) => sum + w, 0),
    [placedWeights],
  );

  const targetInGrams =
    target.unit === "kg" ? target.value * 1000 : target.value;

  const isBalanced =
    !won &&
    Math.abs(totalPlaced - targetInGrams) <= targetInGrams * TOLERANCE;

  const handleAddWeight = useCallback(
    (weight: number) => {
      if (won) return;
      const newPlaced = [...placedWeights, weight];
      setPlacedWeights(newPlaced);

      const newTotal = newPlaced.reduce((s, w) => s + w, 0);
      if (
        Math.abs(newTotal - targetInGrams) <= targetInGrams * TOLERANCE
      ) {
        setWon(true);
        // Delay so the user sees the balanced state
        setTimeout(() => onWin(1), 1200);
      }
    },
    [placedWeights, targetInGrams, won, onWin],
  );

  const handleClear = useCallback(() => {
    if (won) return;
    setPlacedWeights([]);
  }, [won]);

  /** Angle of the balance beam proportional to error. */
  const errorRatio = targetInGrams > 0
    ? Math.max(-1, Math.min(1, (totalPlaced - targetInGrams) / targetInGrams))
    : 0;
  const beamAngle = -errorRatio * 12; // degrees

  const availableWeights = target.unit === "kg" ? WEIGHTS_KG : WEIGHTS_G;
  const weightLabel = (w: number) =>
    target.unit === "kg" ? `${w} kg` : `${w} g`;

  return (
    <div className="smartick-balanza">
      <div className="smartick-balanza__header">
        <h2 className="smartick-balanza__title">⚖️ Equilibrá la balanza</h2>
        {!won && (
          <button
            className="smartick-balanza__skip"
            onClick={onSkip}
            type="button"
            aria-label="Saltar"
          >
            ✕
          </button>
        )}
      </div>

      <p className="smartick-balanza__target">
        Pesá <strong>{target.value} {target.unit}</strong>
      </p>

      {/* ── Balance beam ────────────────────────── */}
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
              {totalPlaced > 0 ? `${totalPlaced}${target.unit === 'kg' ? ' kg' : ' g'}` : "0"}
            </span>
          </div>
        </div>
      </div>

      {/* ── Status ──────────────────────────────── */}
      <div className="smartick-balanza__status">
        {won ? (
          <span className="smartick-balanza__win">🎉 ¡Equilibrado! +1 ⭐</span>
        ) : isBalanced ? (
          <span className="smartick-balanza__balancing">⚖️ ¡Casi! Un toque más…</span>
        ) : totalPlaced > targetInGrams ? (
          <span className="smartick-balanza__over">⬇️ Te pasaste, sacá peso</span>
        ) : totalPlaced === 0 ? (
          <span className="smartick-balanza__hint">Agregá pesas al platillo derecho</span>
        ) : (
          <span className="smartick-balanza__under">⬆️ Falta peso</span>
        )}
      </div>

      {/* ── Weight buttons ──────────────────────── */}
      {!won && (
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

      {!won && placedWeights.length > 0 && (
        <button
          className="smartick-balanza__clear"
          onClick={handleClear}
          type="button"
        >
          🔄 Empezar de nuevo
        </button>
      )}
    </div>
  );
};

export default BalanzaGame;
