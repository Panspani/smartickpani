/**
 * BotellasGame — Llenar un recipiente hasta una marca (capacidad: L / ml).
 *
 * Se muestra una probeta / botella con marcas de volumen y un objetivo
 * (ej: "750 ml"). El usuario agrega o saca agua con botones.
 * Cuando el nivel coincide con el objetivo, gana.
 *
 * @module components/BotellasGame
 */

import React, { useState, useMemo, useCallback } from "react";

export interface BotellasGameProps {
  onWin: (starsToAdd: number) => void;
  onSkip: () => void;
}

// ── Constants ────────────────────────────────────

type TargetUnit = "ml" | "L";

const MIN_TARGET_ML = 100;
const MAX_TARGET_ML = 950;
const STEP_ML = 50;

const MIN_TARGET_L = 1;
const MAX_TARGET_L = 5;

const FILL_STEPS = [50, 100, 200, 500]; // ml per click
const DRAIN_STEPS = [50, 100, 200, 500];

const TOLERANCE_ML = 10;

// ── Helpers ──────────────────────────────────────

function randomTarget(): { value: number; unit: TargetUnit } {
  // 70% chance ml, 30% chance L
  if (Math.random() < 0.7) {
    const v = Math.round(
      (MIN_TARGET_ML + Math.random() * (MAX_TARGET_ML - MIN_TARGET_ML)) /
        STEP_ML,
    ) * STEP_ML;
    return { value: Math.max(STEP_ML, v), unit: "ml" };
  }
  const v =
    MIN_TARGET_L +
    Math.floor(Math.random() * (MAX_TARGET_L - MIN_TARGET_L + 1));
  return { value: v, unit: "L" };
}

/** Max fill level in ml. */
function maxLevel(unit: TargetUnit): number {
  return unit === "L" ? MAX_TARGET_L * 1000 : MAX_TARGET_ML + 100;
}

// ── Component ────────────────────────────────────

const BotellasGame: React.FC<BotellasGameProps> = ({ onWin, onSkip }) => {
  const [target] = useState(randomTarget);
  const [level, setLevel] = useState(0);
  const [won, setWon] = useState(false);

  const targetMl =
    target.unit === "L" ? target.value * 1000 : target.value;
  const maxMl = maxLevel(target.unit);
  const fillPercent = Math.min(100, Math.max(0, (level / maxMl) * 100));

  // Win detection
  const isExact =
    !won &&
    Math.abs(level - targetMl) <= TOLERANCE_ML &&
    level > 0;

  const handleFill = useCallback(
    (amount: number) => {
      if (won) return;
      const newLevel = Math.min(maxMl, level + amount);
      setLevel(newLevel);

      if (Math.abs(newLevel - targetMl) <= TOLERANCE_ML) {
        setWon(true);
        setTimeout(() => onWin(1), 1200);
      }
    },
    [level, maxMl, targetMl, won, onWin],
  );

  const handleDrain = useCallback(
    (amount: number) => {
      if (won) return;
      const newLevel = Math.max(0, level - amount);
      setLevel(newLevel);

      if (Math.abs(newLevel - targetMl) <= TOLERANCE_ML) {
        setWon(true);
        setTimeout(() => onWin(1), 1200);
      }
    },
    [level, targetMl, won, onWin],
  );

  const handleReset = useCallback(() => {
    if (won) return;
    setLevel(0);
  }, [won]);

  const displayLevel =
    target.unit === "L"
      ? `${(level / 1000).toFixed(1)} L`
      : `${level} ml`;

  return (
    <div className="smartick-botellas">
      <div className="smartick-botellas__header">
        <h2 className="smartick-botellas__title">🧪 Llená la probeta</h2>
        {!won && (
          <button
            className="smartick-botellas__skip"
            onClick={onSkip}
            type="button"
            aria-label="Saltar"
          >
            ✕
          </button>
        )}
      </div>

      <p className="smartick-botellas__target">
        Marcá <strong>{target.value} {target.unit}</strong>
      </p>

      {/* ── Measuring cylinder ──────────────────── */}
      <div className="smartick-botellas__cylinder-wrap">
        <div className="smartick-botellas__cylinder">
          {/* Graduation marks */}
          {target.unit === "L"
            ? Array.from({ length: MAX_TARGET_L }, (_, i) => (
                <div
                  key={i}
                  className="smartick-botellas__mark"
                  style={{ bottom: `${((i + 1) / (MAX_TARGET_L + 0.5)) * 100}%` }}
                >
                  <span className="smartick-botellas__mark-label">
                    {i + 1}L
                  </span>
                </div>
              ))
            : Array.from({ length: 10 }, (_, i) => (
                <div
                  key={i}
                  className="smartick-botellas__mark"
                  style={{
                    bottom: `${((i + 1) / 11) * 100}%`,
                  }}
                >
                  <span className="smartick-botellas__mark-label">
                    {(i + 1) * 100}ml
                  </span>
                </div>
              ))}
          {/* Water fill */}
          <div
            className="smartick-botellas__fill"
            style={{ height: `${fillPercent}%` }}
          >
            <span className="smartick-botellas__fill-label">{displayLevel}</span>
          </div>
          {/* Target arrow */}
          <div
            className="smartick-botellas__target-arrow"
            style={{ bottom: `${(targetMl / maxMl) * 100}%` }}
          >
            ◀
          </div>
        </div>
      </div>

      {/* ── Status ──────────────────────────────── */}
      <div className="smartick-botellas__status">
        {won ? (
          <span className="smartick-botellas__win">🎉 ¡Medida exacta! +1 ⭐</span>
        ) : isExact ? (
          <span className="smartick-botellas__exact">✓ ¡Justo!</span>
        ) : level > targetMl + TOLERANCE_ML ? (
          <span className="smartick-botellas__over">⬇️ Te pasaste, vaciá un poco</span>
        ) : level === 0 ? (
          <span className="smartick-botellas__hint">Agregá agua con los botones</span>
        ) : (
          <span className="smartick-botellas__under">⬆️ Un poco más</span>
        )}
      </div>

      {/* ── Controls ────────────────────────────── */}
      {!won && (
        <div className="smartick-botellas__controls">
          <div className="smartick-botellas__control-group">
            <span className="smartick-botellas__control-label">Llenar</span>
            <div className="smartick-botellas__buttons">
              {FILL_STEPS.map((s) => (
                <button
                  key={`fill-${s}`}
                  className="smartick-botellas__btn smartick-botellas__btn--fill"
                  onClick={() => handleFill(s)}
                  type="button"
                  disabled={level >= maxMl}
                >
                  +{target.unit === "L" ? `${s / 1000}L` : `${s}ml`}
                </button>
              ))}
            </div>
          </div>
          <div className="smartick-botellas__control-group">
            <span className="smartick-botellas__control-label">Vaciar</span>
            <div className="smartick-botellas__buttons">
              {DRAIN_STEPS.map((s) => (
                <button
                  key={`drain-${s}`}
                  className="smartick-botellas__btn smartick-botellas__btn--drain"
                  onClick={() => handleDrain(s)}
                  type="button"
                  disabled={level <= 0}
                >
                  -{target.unit === "L" ? `${s / 1000}L` : `${s}ml`}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {!won && level > 0 && (
        <button
          className="smartick-botellas__reset"
          onClick={handleReset}
          type="button"
        >
          🔄 Vaciar todo
        </button>
      )}
    </div>
  );
};

export default BotellasGame;
