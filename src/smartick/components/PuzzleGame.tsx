/**
 * PuzzleGame — 3×3 sliding tile puzzle.
 *
 * Tiles numbered 1-8, one empty slot. Tap a tile adjacent to the empty slot
 * to slide it. Win when tiles are in order 1-8 with empty at bottom-right.
 * Hint appears after 30 moves.
 *
 * Star reward: +1⭐ on win, +2⭐ if solved in <30 moves.
 *
 * @module components/PuzzleGame
 */

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";

// ── Props ──────────────────────────────────────────

export interface PuzzleGameProps {
  onWin: (stars: number) => void;
  onSkip: () => void;
}

// ── Constants ──────────────────────────────────────

const GRID_SIZE = 3;
const TOTAL_TILES = GRID_SIZE * GRID_SIZE; // 9 (1-8 + 0 = empty)
const SOLVED_TILES: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 0];
const SHUFFLE_MOVES = 150;

// ── Helpers ────────────────────────────────────────

/** Get indices adjacent to `index` in a square grid. */
function getAdjacentIndices(index: number, size: number): number[] {
  const row = Math.floor(index / size);
  const col = index % size;
  const neighbors: number[] = [];

  if (row > 0) neighbors.push(index - size); // up
  if (row < size - 1) neighbors.push(index + size); // down
  if (col > 0) neighbors.push(index - 1); // left
  if (col < size - 1) neighbors.push(index + 1); // right

  return neighbors;
}

/** Generate a solvable shuffled puzzle by performing random moves from solved state. */
function generateShuffledTiles(): number[] {
  const tiles = [...SOLVED_TILES];
  let emptyIndex = tiles.indexOf(0);

  for (let i = 0; i < SHUFFLE_MOVES; i++) {
    const neighbors = getAdjacentIndices(emptyIndex, GRID_SIZE);
    const randomNeighbor =
      neighbors[Math.floor(Math.random() * neighbors.length)];

    // Swap
    tiles[emptyIndex] = tiles[randomNeighbor];
    tiles[randomNeighbor] = 0;
    emptyIndex = randomNeighbor;
  }

  // If the puzzle is already solved after shuffle, reshuffle
  if (tiles.every((t, i) => t === SOLVED_TILES[i])) {
    return generateShuffledTiles();
  }

  return tiles;
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

/** Format seconds into MM:SS. */
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

// ── Component ──────────────────────────────────────

const PuzzleGame: React.FC<PuzzleGameProps> = ({ onWin, onSkip }) => {
  const [tiles, setTiles] = useState<number[]>(() => generateShuffledTiles());
  const [moves, setMoves] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [gamePhase, setGamePhase] = useState<"playing" | "won">("playing");
  const [showBackButton, setShowBackButton] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hintTile, setHintTile] = useState<number | null>(null);
  const [slidingTile, setSlidingTile] = useState<number | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const confetti = useMemo(() => generateConfetti(24), []);

  const emptyIndex = tiles.indexOf(0);
  const isSolved = tiles.every((t, i) => t === SOLVED_TILES[i]);

  // ── Timer ────────────────────────────────────────

  useEffect(() => {
    if (gamePhase === "playing") {
      timerRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gamePhase]);

  // ── Win detection ────────────────────────────────

  useEffect(() => {
    if (isSolved && gamePhase === "playing") {
      setGamePhase("won");
      if (timerRef.current) clearInterval(timerRef.current);
      setTimeout(() => setShowBackButton(true), 1800);
    }
  }, [isSolved, gamePhase]);

  // ── Hint at 30 moves ─────────────────────────────

  useEffect(() => {
    if (moves >= 30 && gamePhase === "playing") {
      setShowHint(true);
      // Find a tile adjacent to empty that is NOT in its correct position
      const neighbors = getAdjacentIndices(emptyIndex, GRID_SIZE);
      const wrongTile = neighbors.find(
        (idx) => tiles[idx] !== SOLVED_TILES[idx],
      );
      if (wrongTile !== undefined) {
        setHintTile(tiles[wrongTile]);
      } else {
        // All adjacent tiles are correct — pick any moveable tile
        setHintTile(tiles[neighbors[0]]);
      }
    } else {
      setShowHint(false);
      setHintTile(null);
    }
  }, [moves, gamePhase, emptyIndex, tiles]);

  // ── Handlers ─────────────────────────────────────

  const handleTileTap = useCallback(
    (index: number) => {
      if (gamePhase !== "playing") return;
      if (index === emptyIndex) return;

      // Check if tapped tile is adjacent to empty slot
      const neighbors = getAdjacentIndices(emptyIndex, GRID_SIZE);
      if (!neighbors.includes(index)) return;

      // Slide animation state
      setSlidingTile(tiles[index]);
      setTimeout(() => setSlidingTile(null), 200);

      // Swap tile with empty slot
      setTiles((prev) => {
        const next = [...prev];
        next[emptyIndex] = next[index];
        next[index] = 0;
        return next;
      });

      setMoves((prev) => prev + 1);
    },
    [emptyIndex, gamePhase, tiles],
  );

  const handleHintClick = () => {
    // Hint is already computed — highlight the hint tile for 3s
    setShowHint(false); // Hide the button
    // The hint tile is already stored in state
    setTimeout(() => setHintTile(null), 3000);
  };

  // ── Render ───────────────────────────────────────

  const starsToAward = moves < 30 ? 2 : 1;

  return (
    <div className="smartick-minigame">
      {/* ── Header ────────────────────────────── */}
      <header className="smartick-minigame__header">
        <div className="smartick-minigame__header-top">
          <h2 className="smartick-minigame__title">🧩 Puzzle</h2>
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
            Movimientos: <strong>{moves}</strong>
          </span>
          <span className="smartick-minigame__stat">
            Tiempo: <strong>{formatTime(elapsed)}</strong>
          </span>
        </div>
      </header>

      {/* ── Tile grid ─────────────────────────── */}
      <div className="smartick-minigame__puzzle-grid">
        {tiles.map((tileValue, index) => {
          if (tileValue === 0) {
            return (
              <div
                key={`empty-${index}`}
                className="smartick-minigame__puzzle-empty"
              />
            );
          }

          const isHinted = hintTile === tileValue;
          const isSliding = slidingTile === tileValue;

          return (
            <button
              key={`tile-${tileValue}`}
              className={`smartick-minigame__puzzle-tile ${
                isHinted ? "smartick-minigame__puzzle-tile--hint" : ""
              } ${isSliding ? "smartick-minigame__puzzle-tile--sliding" : ""}`}
              onClick={() => handleTileTap(index)}
              disabled={gamePhase === "won"}
              type="button"
              aria-label={`Ficha ${tileValue}`}
            >
              <span className="smartick-minigame__puzzle-tile-text">
                {tileValue}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Hint button ───────────────────────── */}
      {showHint && gamePhase === "playing" && (
        <div className="smartick-minigame__hint-area">
          <button
            className="smartick-minigame__hint-button"
            onClick={handleHintClick}
            type="button"
          >
            ¿Necesitás ayuda?
          </button>
        </div>
      )}

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
            <span className="smartick-minigame__win-stars">
              +{starsToAward} ⭐
            </span>
            {moves < 30 && (
              <span className="smartick-minigame__win-subtext">
                ¡Menos de 30 movimientos!
              </span>
            )}
          </div>

          {/* Back button (appears after delay) */}
          {showBackButton && (
            <button
              className="smartick-minigame__back-button"
              onClick={() => onWin(starsToAward)}
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

export default PuzzleGame;
