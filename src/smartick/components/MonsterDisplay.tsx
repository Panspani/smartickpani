/**
 * MonsterDisplay — Animated geometric monster mascot.
 *
 * 5 SVG states (idle, happy, sad, thinking, celebration) with CSS animations.
 * Inline SVG, zero network requests, fixed container size.
 * Auto-returns to idle after 2-3s for non-idle states.
 *
 * @module components/MonsterDisplay
 */

import React, { useEffect, useState, useRef } from "react";

export type MonsterState =
  | "idle"
  | "happy"
  | "sad"
  | "thinking"
  | "celebration";

export interface MonsterDisplayProps {
  state: MonsterState;
  size?: "small" | "medium" | "large";
  className?: string;
}

const SIZES: Record<NonNullable<MonsterDisplayProps["size"]>, number> = {
  small: 60,
  medium: 120,
  large: 180,
};

/** Map non-idle states to auto-return duration (ms). */
const AUTO_RETURN_MS: Record<MonsterState, number> = {
  idle: 0,
  happy: 2000,
  sad: 2000,
  thinking: 3000,
  celebration: 3000,
};

/**
 * Geometric monster SVG — abstract/minimalist style.
 * Body is a rounded rect, with circles for eyes,
 * paths for mouth, simple geometric ears, arms, feet.
 * Uses CSS classes to toggle state-specific elements.
 */
const MonsterDisplay: React.FC<MonsterDisplayProps> = ({
  state: externalState,
  size = "medium",
  className = "",
}) => {
  const [currentState, setCurrentState] = useState<MonsterState>(externalState);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync external state + auto-return timer
  useEffect(() => {
    setCurrentState(externalState);

    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    // Set auto-return for non-idle states
    if (externalState !== "idle") {
      timerRef.current = setTimeout(() => {
        setCurrentState("idle");
        timerRef.current = null;
      }, AUTO_RETURN_MS[externalState]);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [externalState]);

  const px = SIZES[size];
  const aspectRatio = 120 / 140;
  const height = px / aspectRatio;

  return (
    <div
      className={`monster-display monster-display--${currentState} ${className}`}
      style={{ width: px, height }}
      role="img"
      aria-label={`Mascota: ${currentState}`}
    >
      <svg viewBox="0 0 120 140" width="100%" height="100%" aria-hidden="true">
        {/* ── Stars (celebration only) ── */}
        <g className="monster-display__stars">
          <text
            className="monster-display__star"
            x={8}
            y={25}
            fontSize={14}
            fill="var(--smartick-star-gold, #FDCB6E)"
          >
            ★
          </text>
          <text
            className="monster-display__star"
            x={100}
            y={30}
            fontSize={11}
            fill="var(--smartick-star-gold, #FDCB6E)"
          >
            ★
          </text>
          <text
            className="monster-display__star"
            x={15}
            y={105}
            fontSize={10}
            fill="var(--smartick-star-gold, #FDCB6E)"
          >
            ★
          </text>
          <text
            className="monster-display__star"
            x={96}
            y={100}
            fontSize={13}
            fill="var(--smartick-star-gold, #FDCB6E)"
          >
            ★
          </text>
        </g>

        {/* ── Ears ── */}
        {/* Idle ears */}
        <g className="monster-display__ears-idle">
          <rect x={21} y={28} width={14} height={16} rx={7} fill="var(--smartick-primary-light, #FF9F6E)" />
          <rect x={85} y={28} width={14} height={16} rx={7} fill="var(--smartick-primary-light, #FF9F6E)" />
        </g>
        {/* Sad ears (droopy) */}
        <g className="monster-display__ears-sad">
          <rect x={15} y={40} width={14} height={16} rx={7} fill="var(--smartick-primary-light, #FF9F6E)" transform="rotate(-15 22 48)" />
          <rect x={91} y={40} width={14} height={16} rx={7} fill="var(--smartick-primary-light, #FF9F6E)" transform="rotate(15 98 48)" />
        </g>

        {/* ── Feet ── */}
        <rect x={32} y={108} width={20} height={12} rx={6} fill="var(--smartick-primary, #FF6B35)" />
        <rect x={68} y={108} width={20} height={12} rx={6} fill="var(--smartick-primary, #FF6B35)" />

        {/* ── Body ── */}
        <rect
          x={22}
          y={38}
          width={76}
          height={74}
          rx={22}
          fill="var(--smartick-primary-light, #FF9F6E)"
        />

        {/* Belly accent */}
        <rect
          x={34}
          y={54}
          width={52}
          height={48}
          rx={16}
          fill="#FFFFFF"
          opacity={0.35}
        />

        {/* ── Arms ── */}
        {/* Idle arms */}
        <g className="monster-display__arms-idle">
          <rect x={14} y={70} width={12} height={24} rx={6} fill="var(--smartick-primary-light, #FF9F6E)" />
          <rect x={94} y={70} width={12} height={24} rx={6} fill="var(--smartick-primary-light, #FF9F6E)" />
        </g>
        {/* Happy arms (up) */}
        <g className="monster-display__arms-happy">
          <rect x={14} y={46} width={12} height={22} rx={6} fill="var(--smartick-primary-light, #FF9F6E)" transform="rotate(-25 20 57)" />
          <rect x={94} y={46} width={12} height={22} rx={6} fill="var(--smartick-primary-light, #FF9F6E)" transform="rotate(25 100 57)" />
        </g>
        {/* Sad arms (lowered) */}
        <g className="monster-display__arms-sad">
          <rect x={12} y={76} width={12} height={20} rx={6} fill="var(--smartick-primary-light, #FF9F6E)" />
          <rect x={96} y={76} width={12} height={20} rx={6} fill="var(--smartick-primary-light, #FF9F6E)" />
        </g>
        {/* Thinking arm (one up to chin) */}
        <g className="monster-display__arms-thinking">
          <rect x={14} y={70} width={12} height={24} rx={6} fill="var(--smartick-primary-light, #FF9F6E)" />
          <rect x={96} y={60} width={12} height={22} rx={6} fill="var(--smartick-primary-light, #FF9F6E)" transform="rotate(20 102 71)" />
        </g>
        {/* Celebration arms (up high) */}
        <g className="monster-display__arms-celebration">
          <rect x={8} y={40} width={12} height={22} rx={6} fill="var(--smartick-primary-light, #FF9F6E)" transform="rotate(-35 14 51)" />
          <rect x={100} y={40} width={12} height={22} rx={6} fill="var(--smartick-primary-light, #FF9F6E)" transform="rotate(35 106 51)" />
        </g>

        {/* ── Cheeks ── */}
        <circle cx={37} cy={80} r={5} fill="#FF8A80" opacity={0.5} />
        <circle cx={83} cy={80} r={5} fill="#FF8A80" opacity={0.5} />

        {/* ── Eyes ── */}
        {/* Idle eyes */}
        <g className="monster-display__eyes-idle">
          <circle cx={46} cy={72} r={5} fill="var(--smartick-text, #2D3436)" />
          <circle cx={74} cy={72} r={5} fill="var(--smartick-text, #2D3436)" />
          {/* Pupils */}
          <circle cx={47} cy={71} r={2} fill="#FFFFFF" />
          <circle cx={75} cy={71} r={2} fill="#FFFFFF" />
        </g>
        {/* Happy eyes (^ curved) */}
        <g className="monster-display__eyes-happy">
          <path d="M41 74 Q46 66 51 74" stroke="var(--smartick-text, #2D3436)" strokeWidth={3} fill="none" strokeLinecap="round" />
          <path d="M69 74 Q74 66 79 74" stroke="var(--smartick-text, #2D3436)" strokeWidth={3} fill="none" strokeLinecap="round" />
        </g>
        {/* Sad eyes (tilted down) */}
        <g className="monster-display__eyes-sad">
          <ellipse cx={46} cy={74} rx={5} ry={4} fill="var(--smartick-text, #2D3436)" />
          <ellipse cx={74} cy={74} rx={5} ry={4} fill="var(--smartick-text, #2D3436)" />
          <circle cx={46} cy={73} r={1.5} fill="#FFFFFF" />
          <circle cx={74} cy={73} r={1.5} fill="#FFFFFF" />
        </g>
        {/* Thinking eyes (one squinted) */}
        <g className="monster-display__eyes-thinking">
          <circle cx={46} cy={71} r={5} fill="var(--smartick-text, #2D3436)" />
          <circle cx={47} cy={70} r={2} fill="#FFFFFF" />
          {/* Squinted right eye */}
          <rect x={69} y={69} width={10} height={4} rx={2} fill="var(--smartick-text, #2D3436)" />
        </g>
        {/* Celebration eyes (same as happy) */}
        <g className="monster-display__eyes-celebration">
          <path d="M41 74 Q46 66 51 74" stroke="var(--smartick-text, #2D3436)" strokeWidth={3} fill="none" strokeLinecap="round" />
          <path d="M69 74 Q74 66 79 74" stroke="var(--smartick-text, #2D3436)" strokeWidth={3} fill="none" strokeLinecap="round" />
        </g>

        {/* ── Mouth ── */}
        {/* Idle mouth (gentle smile) */}
        <path
          className="monster-display__mouth-idle"
          d="M50 88 Q60 96 70 88"
          stroke="var(--smartick-text, #2D3436)"
          strokeWidth={2.5}
          fill="none"
          strokeLinecap="round"
        />
        {/* Happy mouth (big smile) */}
        <path
          className="monster-display__mouth-happy"
          d="M46 88 Q60 102 74 88"
          stroke="var(--smartick-text, #2D3436)"
          strokeWidth={2.5}
          fill="none"
          strokeLinecap="round"
        />
        {/* Sad mouth (frown) */}
        <path
          className="monster-display__mouth-sad"
          d="M48 92 Q60 84 72 92"
          stroke="var(--smartick-text, #2D3436)"
          strokeWidth={2.5}
          fill="none"
          strokeLinecap="round"
        />
        {/* Thinking mouth (small 'o') */}
        <ellipse
          className="monster-display__mouth-thinking"
          cx={60}
          cy={90}
          rx={5}
          ry={4}
          fill="var(--smartick-text, #2D3436)"
        />
        {/* Celebration mouth (open happy) */}
        <path
          className="monster-display__mouth-celebration"
          d="M46 88 Q60 106 74 88"
          stroke="var(--smartick-text, #2D3436)"
          strokeWidth={2.5}
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

export default MonsterDisplay;
