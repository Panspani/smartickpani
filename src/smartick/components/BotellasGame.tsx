/**
 * BotellasGame — Llenar recipiente hasta una marca (capacidad).
 *
 * 3 rondas progresivas con targets en ml y L.
 *
 * @module components/BotellasGame
 */

import React, { useState, useMemo, useCallback } from "react";

export interface BotellasGameProps {
  onWin: (starsToAdd: number) => void;
  onSkip: () => void;
}

type TargetUnit = "ml" | "L";

interface RoundTarget {
  value: number;
  unit: TargetUnit;
}

const FILL_STEPS = [50, 100, 200, 500];
const DRAIN_STEPS = [50, 100, 200, 500];
const TOLERANCE_ML = 10;

function generateTarget(round: number): RoundTarget {
  if (round === 0) {
    const v = Math.round((100 + Math.random() * 400) / 50) * 50;
    return { value: Math.max(50, v), unit: "ml" };
  }
  if (round === 1) {
    if (Math.random() < 0.5) {
      const v = Math.round((200 + Math.random() * 700) / 50) * 50;
      return { value: Math.max(50, v), unit: "ml" };
    }
    return { value: 1 + Math.floor(Math.random() * 3), unit: "L" };
  }
  // Hard: L with decimal
  const base = 1 + Math.floor(Math.random() * 3);
  const dec = [0, 250, 500, 750][Math.floor(Math.random() * 4)];
  return { value: base + dec / 1000, unit: "L" };
}

function maxLevel(unit: TargetUnit): number {
  return unit === "L" ? 5000 : 1000;
}

const BotellasGame: React.FC<BotellasGameProps> = ({ onWin, onSkip }) => {
  const [round, setRound] = useState(0);
  const [target, setTarget] = useState(() => generateTarget(0));
  const [level, setLevel] = useState(0);
  const [won, setWon] = useState(false);
  const [roundWon, setRoundWon] = useState(false);

  const targetMl = target.unit === "L" ? target.value * 1000 : target.value;
  const maxMl = maxLevel(target.unit);
  const fillPercent = Math.min(100, Math.max(0, (level / maxMl) * 100));

  const handleFill = useCallback(
    (amount: number) => {
      if (won || roundWon) return;
      const newLevel = Math.min(maxMl, level + amount);
      setLevel(newLevel);
      if (Math.abs(newLevel - targetMl) <= TOLERANCE_ML) {
        setRoundWon(true);
        setTimeout(() => {
          if (round >= 2) {
            setWon(true);
            setTimeout(() => onWin(1), 1000);
          } else {
            setRound((r) => r + 1);
            setTarget(generateTarget(round + 1));
            setLevel(0);
            setRoundWon(false);
          }
        }, 1200);
      }
    },
    [level, maxMl, targetMl, round, won, roundWon, onWin],
  );

  const handleDrain = useCallback(
    (amount: number) => {
      if (won || roundWon) return;
      const newLevel = Math.max(0, level - amount);
      setLevel(newLevel);
      if (Math.abs(newLevel - targetMl) <= TOLERANCE_ML) {
        setRoundWon(true);
        setTimeout(() => {
          if (round >= 2) {
            setWon(true);
            setTimeout(() => onWin(1), 1000);
          } else {
            setRound((r) => r + 1);
            setTarget(generateTarget(round + 1));
            setLevel(0);
            setRoundWon(false);
          }
        }, 1200);
      }
    },
    [level, targetMl, round, won, roundWon, onWin],
  );

  const handleReset = useCallback(() => {
    if (won || roundWon) return;
    setLevel(0);
  }, [won, roundWon]);

  const displayLevel =
    target.unit === "L" ? `${(level / 1000).toFixed(1)} L` : `${level} ml`;

  const marks =
    target.unit === "L"
      ? Array.from({ length: 5 }, (_, i) => ({ label: `${i + 1}L`, pct: ((i + 1) / 5.5) * 100 }))
      : Array.from({ length: 10 }, (_, i) => ({ label: `${(i + 1) * 100}ml`, pct: ((i + 1) / 11) * 100 }));

  return (
    <div className="smartick-botellas">
      <div className="smartick-botellas__header">
        <h2 className="smartick-botellas__title">🧪 Llená la probeta</h2>
        {!won && (
          <button className="smartick-botellas__skip" onClick={onSkip} type="button">✕</button>
        )}
      </div>

      <div className="smartick-balanza__rounds">
        {[0, 1, 2].map((r) => (
          <span key={r} className={`smartick-balanza__round-dot ${r < round ? "smartick-balanza__round-dot--done" : ""} ${r === round ? "smartick-balanza__round-dot--active" : ""}`}>
            {r + 1}
          </span>
        ))}
      </div>

      <p className="smartick-botellas__target">
        Marcá <strong>{target.value} {target.unit}</strong>
      </p>

      <div className="smartick-botellas__cylinder-wrap">
        <div className="smartick-botellas__cylinder">
          {marks.map((m, i) => (
            <div key={i} className="smartick-botellas__mark" style={{ bottom: `${m.pct}%` }}>
              <span className="smartick-botellas__mark-label">{m.label}</span>
            </div>
          ))}
          <div className="smartick-botellas__fill" style={{ height: `${fillPercent}%` }}>
            <span className="smartick-botellas__fill-label">{displayLevel}</span>
          </div>
          <div className="smartick-botellas__target-arrow" style={{ bottom: `${(targetMl / maxMl) * 100}%` }}>
            ◀
          </div>
        </div>
      </div>

      <div className="smartick-botellas__status">
        {won ? (
          <span className="smartick-botellas__win">🎉 ¡Completaste! +1 ⭐</span>
        ) : roundWon ? (
          <span className="smartick-botellas__exact">✓ ¡Justo!</span>
        ) : level > targetMl + TOLERANCE_ML ? (
          <span className="smartick-botellas__over">⬇️ Te pasaste</span>
        ) : level === 0 ? (
          <span className="smartick-botellas__hint">Agregá agua</span>
        ) : (
          <span className="smartick-botellas__under">⬆️ Un poco más</span>
        )}
      </div>

      {!won && !roundWon && (
        <div className="smartick-botellas__controls">
          <div className="smartick-botellas__control-group">
            <span className="smartick-botellas__control-label">Llenar</span>
            <div className="smartick-botellas__buttons">
              {FILL_STEPS.map((s) => (
                <button key={`fill-${s}`} className="smartick-botellas__btn smartick-botellas__btn--fill" onClick={() => handleFill(s)} type="button" disabled={level >= maxMl}>
                  +{target.unit === "L" ? `${s / 1000}L` : `${s}ml`}
                </button>
              ))}
            </div>
          </div>
          <div className="smartick-botellas__control-group">
            <span className="smartick-botellas__control-label">Vaciar</span>
            <div className="smartick-botellas__buttons">
              {DRAIN_STEPS.map((s) => (
                <button key={`drain-${s}`} className="smartick-botellas__btn smartick-botellas__btn--drain" onClick={() => handleDrain(s)} type="button" disabled={level <= 0}>
                  -{target.unit === "L" ? `${s / 1000}L` : `${s}ml`}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {!won && !roundWon && level > 0 && (
        <button className="smartick-botellas__reset" onClick={handleReset} type="button">🔄 Vaciar todo</button>
      )}
    </div>
  );
};

export default BotellasGame;
