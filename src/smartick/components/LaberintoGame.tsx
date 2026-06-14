/**
 * LaberintoGame — Number maze grid game.
 *
 * Two modes:
 *   Contextual (recentProblems): grid has problem answers, find them in order
 *   Classic (no problems): snake path 1→N²
 *
 * @module components/LaberintoGame
 */

import React, { useState, useMemo } from "react";
import type { Problem } from "../engine/types";

// ── Props ──────────────────────────────────────────

export interface LaberintoGameProps {
  onWin: (stars: number) => void;
  onSkip: () => void;
  recentProblems?: Problem[];
}

// ── Types ──────────────────────────────────────────

interface CellInfo {
  value: number;
  row: number;
  col: number;
}

// ── Classic helpers ─────────────────────────────────

function generateSolvableGrid(size: number): CellInfo[] {
  const total = size * size;
  const cells: CellInfo[] = [];
  const startRow = Math.random() < 0.5 ? 0 : size - 1;
  const startCol = Math.random() < 0.5 ? 0 : size - 1;
  const rowDir = startRow === 0 ? 1 : -1;
  const colDir = startCol === 0 ? 1 : -1;
  const endCol = startCol + (size - 1) * colDir;

  let value = 1;
  for (let r = 0; r < size; r++) {
    const row = startRow + r * rowDir;
    for (let c = 0; c < size; c++) {
      const col = r % 2 === 0 ? startCol + c * colDir : endCol - c * colDir;
      cells.push({ value, row, col });
      value++;
    }
  }

  if (Math.random() < 0.5) {
    for (const cell of cells) {
      const tmp = cell.row;
      cell.row = cell.col;
      cell.col = tmp;
    }
  }

  return cells;
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function isAdjacent(a: CellInfo, b: CellInfo): boolean {
  const rowDiff = Math.abs(a.row - b.row);
  const colDiff = Math.abs(a.col - b.col);
  return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
}

function generateConfetti(count: number) {
  const COLORS = [
    "var(--smartick-confetti-1, #FF6B35)",
    "var(--smartick-confetti-2, #FFB347)",
    "var(--smartick-confetti-3, #00B894)",
    "var(--smartick-confetti-4, #FDCB6E)",
    "#FF8A5C",
    "#FFD93D",
  ];
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 0.6}s`,
    duration: `${1.2 + Math.random() * 0.8}s`,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: `${5 + Math.random() * 8}px`,
  }));
}

// ── Component ──────────────────────────────────────

const LaberintoGame: React.FC<LaberintoGameProps> = ({
  onWin,
  onSkip,
  recentProblems,
}) => {
  const isContextual =
    recentProblems !== undefined && recentProblems.length >= 2;

  // ═══════════════════════════════════════════════
  // CONTEXTUAL MODE — find problem answers on grid
  // ═══════════════════════════════════════════════

  if (isContextual && recentProblems) {
    const problems = recentProblems;
    const gridSize = problems.length <= 4 ? 3 : 4;
    const totalCells = gridSize * gridSize;

    // Build grid values: problem answers + distractors
    const answers = problems.map((p) => p.answer);
    const distractors: number[] = [];
    while (answers.length + distractors.length < totalCells) {
      const d = Math.floor(Math.random() * 30) + 1;
      if (!answers.includes(d) && !distractors.includes(d)) {
        distractors.push(d);
      }
    }
    const allValues = shuffleArray([...answers, ...distractors]);
    const gridCells = allValues.map((value, index) => ({
      value,
      row: Math.floor(index / gridSize),
      col: index % gridSize,
    }));

    const [problemIndex, setProblemIndex] = useState(0);
    const [foundAnswers, setFoundAnswers] = useState<Set<number>>(new Set());
    const [errorValue, setErrorValue] = useState<number | null>(null);
    const [won, setWon] = useState(false);

    const currentProblem = problems[problemIndex];
    const isLast = problemIndex >= problems.length - 1;

    const handleCellTap = (val: number) => {
      if (won) return;
      if (foundAnswers.has(val)) return;

      if (val === currentProblem.answer) {
        const newFound = new Set(foundAnswers).add(val);
        setFoundAnswers(newFound);
        if (isLast) {
          setWon(true);
          setTimeout(() => onWin(1), 1000);
        } else {
          setProblemIndex((p) => p + 1);
        }
      } else {
        setErrorValue(val);
        setTimeout(() => setErrorValue(null), 300);
      }
    };

    return (
      <div className="smartick-minigame">
        <header className="smartick-minigame__header">
          <div className="smartick-minigame__header-top">
            <h2 className="smartick-minigame__title">🔍 Buscá la respuesta</h2>
            {!won && (
              <button
                className="smartick-minigame__skip-button"
                onClick={onSkip}
                type="button"
                aria-label="Saltear"
              >
                ✕
              </button>
            )}
          </div>
        </header>

        {!won && (
          <p className="smartick-minigame__context-hint">
            <strong>
              {currentProblem.text.replace(/\?$/, "")} = <u>?</u>
            </strong>
          </p>
        )}

        <div
          className="smartick-minigame__grid"
          style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
        >
          {gridCells.map((cell) => {
            const isFound = foundAnswers.has(cell.value);
            const isError = errorValue === cell.value;
            return (
              <button
                key={`${cell.row}-${cell.col}`}
                className={`smartick-minigame__cell ${
                  isFound ? "smartick-minigame__cell--found" : ""
                } ${isError ? "smartick-minigame__cell--error" : ""}`}
                onClick={() => handleCellTap(cell.value)}
                disabled={won || isFound}
                type="button"
                aria-label={`Valor ${cell.value}`}
              >
                <span className="smartick-minigame__cell-text">
                  {cell.value}
                </span>
              </button>
            );
          })}
        </div>

        <div className="smartick-minigame__stats">
          <span className="smartick-minigame__stat">
            {problemIndex + 1} / {problems.length}
          </span>
        </div>

        {won && (
          <div className="smartick-minigame__win-overlay">
            <div className="smartick-minigame__win-banner">
              <span className="smartick-minigame__win-text">
                🎉 ¡Todas las respuestas!
              </span>
              <span className="smartick-minigame__win-stars">+1 ⭐</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ═══════════════════════════════════════════════
  // CLASSIC MODE — snake path 1 → N²
  // ═══════════════════════════════════════════════

  const [gridSize] = useState(() => {
    const sizes = [3, 4, 5];
    return sizes[Math.floor(Math.random() * sizes.length)];
  });

  const totalCells = gridSize * gridSize;
  const [cells] = useState<CellInfo[]>(() => generateSolvableGrid(gridSize));
  const [currentValue, setCurrentValue] = useState(1);
  const [visitedValues, setVisitedValues] = useState<Set<number>>(
    () => new Set([1]),
  );
  const [wrongTaps, setWrongTaps] = useState(0);
  const [errorValue, setErrorValue] = useState<number | null>(null);
  const [gamePhase, setGamePhase] = useState<"playing" | "won">("playing");
  const [showBackButton, setShowBackButton] = useState(false);

  const confetti = useMemo(() => generateConfetti(24), []);

  const currentCell = cells.find((c) => c.value === currentValue)!;
  const nextValue = currentValue + 1;

  const handleCellTap = (value: number) => {
    if (gamePhase !== "playing") return;
    if (value === currentValue) return;

    const targetCell = cells.find((c) => c.value === value);
    if (!currentCell || !targetCell) return;

    if (value === nextValue && isAdjacent(currentCell, targetCell)) {
      setCurrentValue(value);
      setVisitedValues((prev) => new Set(prev).add(value));
      if (value === totalCells) {
        setGamePhase("won");
        setTimeout(() => setShowBackButton(true), 1800);
      }
    } else {
      setWrongTaps((prev) => prev + 1);
      setErrorValue(value);
      setTimeout(() => setErrorValue(null), 300);
    }
  };

  return (
    <div className="smartick-minigame">
      <header className="smartick-minigame__header">
        <div className="smartick-minigame__header-top">
          <h2 className="smartick-minigame__title">🧩 Laberinto</h2>
          {gamePhase === "playing" && (
            <button
              className="smartick-minigame__skip-button"
              onClick={onSkip}
              type="button"
              aria-label="Saltear"
            >
              ✕
            </button>
          )}
        </div>
        <div className="smartick-minigame__stats">
          <span className="smartick-minigame__stat">
            Siguiente:{" "}
            <strong>{nextValue <= totalCells ? nextValue : "—"}</strong>
          </span>
          <span className="smartick-minigame__stat">
            Errores: <strong>{wrongTaps}</strong>
          </span>
        </div>
      </header>

      <div
        className="smartick-minigame__grid"
        style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
      >
        {cells.map((cell) => {
          const isCurrent = cell.value === currentValue;
          const isVisited = !isCurrent && visitedValues.has(cell.value);
          const isError = cell.value === errorValue;

          return (
            <button
              key={cell.value}
              className={`smartick-minigame__cell ${
                isCurrent ? "smartick-minigame__cell--current" : ""
              } ${isVisited ? "smartick-minigame__cell--visited" : ""} ${
                isError ? "smartick-minigame__cell--error" : ""
              }`}
              onClick={() => handleCellTap(cell.value)}
              disabled={gamePhase === "won"}
              type="button"
              aria-label={`Número ${cell.value}`}
            >
              <span className="smartick-minigame__cell-text">
                {cell.value}
              </span>
            </button>
          );
        })}
      </div>

      {gamePhase === "won" && (
        <div className="smartick-minigame__win-overlay">
          <div className="smartick-minigame__confetti" aria-hidden="true">
            {confetti.map((p) => (
              <span
                key={p.id}
                className="smartick-minigame__confetti-particle"
                style={{
                  left: p.left,
                  animationDelay: p.delay,
                  animationDuration: p.duration,
                  backgroundColor: p.color,
                  width: p.size,
                  height: p.size,
                }}
              />
            ))}
          </div>

          <div className="smartick-minigame__win-banner">
            <span className="smartick-minigame__win-text">🎉 ¡Ganaste!</span>
            <span className="smartick-minigame__win-stars">+1 ⭐</span>
          </div>

          {showBackButton && (
            <button
              className="smartick-minigame__back-button"
              onClick={() => onWin(1)}
              type="button"
            >
              Volver al inicio
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default LaberintoGame;
