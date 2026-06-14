/**
 * MiniConfetti — Small confetti burst for correct answers.
 *
 * Renders ≤20 particles that animate from center outward, ≤1s duration.
 * Used inside FeedbackOverlay when type === 'correct'.
 * Decorative only — aria-hidden="true".
 *
 * @module components/MiniConfetti
 */

import React, { useMemo } from "react";

export interface MiniConfettiProps {
  /** When true, renders the confetti particles. */
  play: boolean;
}

const COLORS = [
  "var(--smartick-confetti-1, #FF6B35)",
  "var(--smartick-confetti-2, #FFB347)",
  "var(--smartick-confetti-3, #00B894)",
  "var(--smartick-confetti-4, #FDCB6E)",
  "#FF8A5C",
  "#FFD93D",
];

interface Particle {
  id: number;
  angle: number;
  distance: number;
  delay: string;
  color: string;
}

const PARTICLE_COUNT = 16;

function generateParticles(): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const angle = (Math.PI * 2 * i) / PARTICLE_COUNT + (Math.random() - 0.5) * 0.5;
    particles.push({
      id: i,
      angle,
      distance: 30 + Math.random() * 40,
      delay: `${(Math.random() * 0.15).toFixed(3)}s`,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    });
  }
  return particles;
}

const MiniConfetti: React.FC<MiniConfettiProps> = ({ play }) => {
  const particles = useMemo(() => (play ? generateParticles() : []), [play]);

  if (!play || particles.length === 0) return null;

  return (
    <div className="smartick-mini-confetti" aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.id}
          className="smartick-mini-confetti__particle"
          style={{
            transform: `translate(${Math.cos(p.angle) * p.distance}px, ${Math.sin(p.angle) * p.distance}px)`,
            animationDelay: p.delay,
            backgroundColor: p.color,
          }}
        />
      ))}
    </div>
  );
};

export default MiniConfetti;
