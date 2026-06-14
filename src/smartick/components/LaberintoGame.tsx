/**
 * LaberintoGame — Number maze grid game.
 *
 * Grid (3×3, 4×4, or 5×5) with shuffled numbers 1 to N².
 * Player starts at 1 and must tap adjacent cells containing the next
 * number in sequence. Wrong taps flash red. Win = reach the last number.
 *
 * @module components/LaberintoGame
 */

import React, { useState, useMemo } from "react";

// ── Props ──────────────────────────────────────────

export interface LaberintoGameProps {
  onWin: (stars: number) => void;
  onSkip: () => void;
}

// ── Types ──────────────────────────────────────────

interface CellInfo {
  value: number;
  row: number;
  col: number;
}

// ── Helpers ────────────────────────────────────────

/**
 * Generate a solvable number maze grid using a snake pattern.
 *
 * Numbers 1 through N² are placed along a Hamiltonian path through the grid,
 * ensuring each consecutive number pair is ADJACENT. The snake starts from
 * a random corner and snakes through rows in alternating directions.
 * Grid rotation (transpose) adds variety.
 */
function generateSolvableGrid(size: number): CellInfo[] {
  const total = size * size;
  const cells: CellInfo[] = [];

  // Random starting corner
  const startRow = Math.random() < 0.5 ? 0 : size - 1;
  const startCol = Math.random() < 0.5 ? 0 : size - 1;
  const rowDir = startRow === 0 ? 1 : -1;
  const colDir = startCol === 0 ? 1 : -1;
  const endCol = startCol + (size - 1) * colDir;

  let value = 1;
  for (let r = 0; r < size; r++) {
    const row = startRow + r * rowDir;
    for (let c = 0; c < size; c++) {
      // Even rows: normal direction; odd rows: reverse (snake)
      const col = r % 2 === 0
        ? startCol + c * colDir
        : endCol - c * colDir;
      cells.push({ value, row, col });
      value++;
    }
  }

  // Randomly transpose (flip over diagonal) for more variety
  if (Math.random() < 0.5) {
    for (const cell of cells) {
      const tmp = cell.row;
      cell.row = cell.col;
      cell.col = tmp;
    }
  }

  return cells;
}

/** Generate confetti particles for the win celebration. */
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

/** Check if two cells are adjacent (up/down/left/right). */
function isAdjacent(a: CellInfo, b: CellInfo): boolean {
  const rowDiff = Math.abs(a.row - b.row);
  const colDiff = Math.abs(a.col - b.col);
  return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
}

// ── Component ──────────────────────────────────────

const LaberintoGame: React.FC<LaberintoGameProps> = ({ onWin, onSkip }) => {
  // Grid size: random 3, 4, or 5 (cap at 4 for very small screens)
  const [gridSize] = useState(() => {
    const sizes = [3, 4, 5];
    if (window.innerWidth <= 360) {
      // Only 3 or 4 for small screens
      return sizes[Math.floor(Math.random() * 2)];
    }
    return sizes[Math.floor(Math.random() * sizes.length)];
  });

  const totalCells = gridSize * gridSize;

  // Generate grid once
  const [cells] = useState<CellInfo[]>(() => generateSolvableGrid(gridSize));

  // Game state
  const [currentValue, setCurrentValue] = useState(1);
  const [visitedValues, setVisitedValues] = useState<Set<number>>(
    () => new Set([1]),
  );
  const [wrongTaps, setWrongTaps] = useState(0);
  const [errorValue, setErrorValue] = useState<number | null>(null);
  const [gamePhase, setGamePhase] = useState<"playing" | "won">("playing");
  const [showBackButton, setShowBackButton] = useState(false);

  // Confetti (stable)
  const confetti = useMemo(() => generateConfetti(24), []);

  const currentCell = cells.find((c) => c.value === currentValue)!;
  const nextValue = currentValue + 1;

  // ── Handlers ─────────────────────────────────────

  const handleCellTap = (value: number) => {
    if (gamePhase !== "playing") return;
    if (value === currentValue) return; // Tapping the same cell

    const targetCell = cells.find((c) => c.value === value);
    if (!currentCell || !targetCell) return;

    // Valid move: correct next number AND adjacent to current position
    if (value === nextValue && isAdjacent(currentCell, targetCell)) {
      setCurrentValue(value);
      setVisitedValues((prev) => new Set(prev).add(value));

      // Win detection
      if (value === totalCells) {
        setGamePhase("won");
        setTimeout(() => setShowBackButton(true), 1800);
      }
    } else {
      // Invalid move
      setWrongTaps((prev) => prev + 1);
      setErrorValue(value);
      setTimeout(() => setErrorValue(null), 300);
    }
  };

  // ── Render ───────────────────────────────────────

  return (
    <div className="smartick-minigame">
      {/* ── Header ────────────────────────────── */}
      <header className="smartick-minigame__header">
        <div className="smartick-minigame__header-top">
          <h2 className="smartick-minigame__title">🧩 Laberinto</h2>
          {gamePhase === "playing" && (
            <button
              className="smartick-minigame__skip-button"
              onClick={onSkip}
              type="button"
              aria-label="Saltear minijuego"
            >
              ✕
            </button>
          )}
        </div>
        <div className="smartick-minigame__stats">
          <span className="smartick-minigame__stat">
            Siguiente:{" "}
            <strong>
              {nextValue <= totalCells ? nextValue : "—"}
            </strong>
          </span>
          <span className="smartick-minigame__stat">
            Errores: <strong>{wrongTaps}</strong>
          </span>
        </div>
      </header>

      {/* ── Number grid ───────────────────────── */}
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

      {/* ── Win overlay ───────────────────────── */}
      {gamePhase === "won" && (
        <div className="smartick-minigame__win-overlay">
          {/* Confetti */}
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

          {/* Banner */}
          <div className="smartick-minigame__win-banner">
            <span className="smartick-minigame__win-text">
              🎉 ¡Ganaste!
            </span>
            <span className="smartick-minigame__win-stars">+1 ⭐</span>
          </div>

          {/* Back button (appears after delay) */}
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
