/**
 * MiniGameScreen — Post-session Memory card game.
 *
 * Juego de memoria con grilla 4×4 (default) o 4×3 (pantallas ≤360px).
 * Mecánica: tap para revelar, match/mismatch, victoria con celebración.
 * Diseñado como premio relajado — sin límite de intentos ni derrota.
 *
 * @module components/MiniGameScreen
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import MonsterDisplay from "./MonsterDisplay";
import type { MonsterState } from "./MonsterDisplay";
import type { Problem } from "../engine/types";
import LaberintoGame from "./LaberintoGame";
import PuzzleGame from "./PuzzleGame";

export interface MiniGameScreenProps {
  /** Se llama al ganar con la cantidad de estrellas bonus (+2). */
  onWin: (starsToAdd: number) => void;
  /** Se llama si el usuario saltea el juego. */
  onSkip: () => void;
  /** Problemas recientes para modo memory contextual (opcional). */
  contextualProblems?: Problem[];
}

/** Emojis/shapes para los pares del memory. */
const CARD_VALUES = ["🔴", "🟦", "🟢", "⭐", "🔺", "🔶", "💜", "🧡"];

/** Available game types for random selection. */
const GAME_TYPES = ["memory", "laberinto", "puzzle"] as const;
type GameType = (typeof GAME_TYPES)[number];

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface Card {
  id: number;
  value: string;
  /** Display text (for contextual mode where value is an ID). */
  displayText?: string;
  isFlipped: boolean;
  isMatched: boolean;
}

type GamePhase = "playing" | "won";

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

/** Fisher-Yates shuffle (pure). */
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Create a shuffled deck of paired cards. */
function createCards(pairCount: number): Card[] {
  const values = CARD_VALUES.slice(0, pairCount);
  const pairs = values.flatMap((value, index) => [
    { id: index * 2, value, isFlipped: false, isMatched: false },
    { id: index * 2 + 1, value, isFlipped: false, isMatched: false },
  ]);
  return shuffleArray(pairs);
}

/**
 * Create a shuffled deck of contextual problem→answer cards.
 * Each problem generates a pair: one card shows the problem text,
 * the matching card shows the answer.
 */
function createContextualCards(problems: Problem[]): Card[] {
  const count = Math.min(problems.length, 6); // max 6 pairs
  const selected = problems.slice(0, count);
  const pairs = selected.flatMap((problem, index) => {
    const pairId = `ctx-${index}`;
    return [
      {
        id: index * 2,
        value: pairId,
        displayText: problem.text.replace(/\?$/, " = ?"),
        isFlipped: false,
        isMatched: false,
      },
      {
        id: index * 2 + 1,
        value: pairId,
        displayText: String(problem.answer),
        isFlipped: false,
        isMatched: false,
      },
    ];
  });
  return shuffleArray(pairs);
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

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

const MiniGameScreen: React.FC<MiniGameScreenProps> = ({
  onWin,
  onSkip,
  contextualProblems,
}) => {
  // When contextual problems exist, force memory game with contextual pairs
  const isContextual = contextualProblems !== undefined && contextualProblems.length >= 2;

  // Random game type selection on mount (only if non-contextual)
  const [gameType] = useState<GameType>(() =>
    isContextual ? "memory" : GAME_TYPES[Math.floor(Math.random() * GAME_TYPES.length)],
  );

  // Determine pair count based on viewport
  const [pairCount] = useState(() => (window.innerWidth <= 360 ? 6 : 8));

  const [cards, setCards] = useState<Card[]>(() =>
    isContextual && contextualProblems
      ? createContextualCards(contextualProblems)
      : createCards(pairCount),
  );
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [gamePhase, setGamePhase] = useState<GamePhase>("playing");
  const [monsterState, setMonsterState] = useState<MonsterState>("idle");
  const [showBackButton, setShowBackButton] = useState(false);

  const totalPairs = cards.length / 2;
  const matchedPairs = cards.filter((c) => c.isMatched).length;

  // Win detection
  useEffect(() => {
    if (matchedPairs === cards.length && gamePhase === "playing") {
      setGamePhase("won");
      setMonsterState("celebration");
      // Delay "Volver" button so celebration plays first
      const timer = setTimeout(() => setShowBackButton(true), 1800);
      return () => clearTimeout(timer);
    }
  }, [matchedPairs, cards.length, gamePhase]);

  // Card tap handler
  const handleCardTap = useCallback(
    (cardId: number) => {
      if (isChecking || gamePhase !== "playing") return;

      const card = cards.find((c) => c.id === cardId);
      if (!card || card.isFlipped || card.isMatched) return;

      // Flip this card
      const newFlipped = [...flippedIds, cardId];
      setFlippedIds(newFlipped);
      setCards((prev) =>
        prev.map((c) => (c.id === cardId ? { ...c, isFlipped: true } : c)),
      );

      // If two cards are now flipped, check for match
      if (newFlipped.length === 2) {
        setMoves((m) => m + 1);
        setIsChecking(true);

        const [firstId, secondId] = newFlipped;
        const first = cards.find((c) => c.id === firstId)!;
        const second = cards.find((c) => c.id === secondId)!;

        if (first.value === second.value) {
          // ✅ Match — glow and keep visible
          setTimeout(() => {
            setCards((prev) =>
              prev.map((c) =>
                c.id === firstId || c.id === secondId
                  ? { ...c, isMatched: true }
                  : c,
              ),
            );
            setFlippedIds([]);
            setIsChecking(false);
          }, 400);
        } else {
          // ❌ No match — flip back after 1s
          setTimeout(() => {
            setCards((prev) =>
              prev.map((c) =>
                c.id === firstId || c.id === secondId
                  ? { ...c, isFlipped: false }
                  : c,
              ),
            );
            setFlippedIds([]);
            setIsChecking(false);
          }, 1000);
        }
      }
    },
    [cards, flippedIds, isChecking, gamePhase],
  );

  // Confetti particles (stable across re-renders)
  const confetti = useMemo(() => generateConfetti(24), []);

  // Render the selected game type (laberinto / puzzle / memory)
  if (gameType === "laberinto") {
    return <LaberintoGame onWin={onWin} onSkip={onSkip} recentProblems={contextualProblems} />;
  }
  if (gameType === "puzzle") {
    return <PuzzleGame onWin={onWin} onSkip={onSkip} />;
  }

  // ── Memory game (existing, unchanged) ──────────

  return (
    <div className="smartick-minigame">
      {/* ── Header ──────────────────────────────── */}
      <header className="smartick-minigame__header">
        <div className="smartick-minigame__header-top">
          <h2 className="smartick-minigame__title">🎮 Memoria</h2>
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
            Intentos: <strong>{moves}</strong>
          </span>
          <span className="smartick-minigame__stat">
            Pares: <strong>{matchedPairs}</strong>/{totalPairs}
          </span>
        </div>
      </header>

      {/* ── Card grid ───────────────────────────── */}
      <div className="smartick-minigame__grid">
        {cards.map((card) => {
          const isMismatch =
            isChecking &&
            card.isFlipped &&
            !card.isMatched &&
            flippedIds.includes(card.id) &&
            flippedIds.length === 2;

          return (
            <button
              key={card.id}
              className={`smartick-minigame__card ${
                card.isFlipped ? "smartick-minigame__card--flipped" : ""
              } ${card.isMatched ? "smartick-minigame__card--matched" : ""} ${
                isMismatch ? "smartick-minigame__card--mismatch" : ""
              }`}
              onClick={() => handleCardTap(card.id)}
              disabled={card.isMatched || gamePhase === "won"}
              type="button"
              aria-label={
                card.isFlipped
                  ? `Carta: ${card.displayText ?? card.value}`
                  : "Carta tapada"
              }
            >
              <div className="smartick-minigame__card-inner">
                <div className="smartick-minigame__card-front">
                  <span className="smartick-minigame__card-question">?</span>
                </div>
                <div className="smartick-minigame__card-back">
                  <span className="smartick-minigame__card-value">
                    {card.displayText ?? card.value}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Monster mascot ──────────────────────── */}
      <div className="smartick-minigame__mascot">
        <MonsterDisplay state={monsterState} size="medium" />
      </div>

      {/* ── Win overlay ─────────────────────────── */}
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
            <span className="smartick-minigame__win-text">🎉 ¡Ganaste!</span>
            <span className="smartick-minigame__win-stars">+2 ⭐</span>
          </div>

          {/* Monster celebration */}
          <div className="smartick-minigame__win-mascot">
            <MonsterDisplay state="celebration" size="large" />
          </div>

          {/* Back button (appears after delay) */}
          {showBackButton && (
            <button
              className="smartick-minigame__back-button"
              onClick={() => onWin(2)}
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

export default MiniGameScreen;
