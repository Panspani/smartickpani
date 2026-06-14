/**
 * ScaleScene — CLAYMORPHISM PRO SVG balance scale.
 *
 * Soft 3D balance with chunky elements, double shadows,
 * pastel palette, bouncy animations.
 *
 * @module components/scenes/ScaleScene
 */

import React, { useMemo } from "react";
import type { ScaleScene as ScaleSceneType } from "../../engine/scenes/types";
import { SCENE_ICONS, ICON_GRADIENTS } from "./SceneIcons";

interface ScaleSceneProps {
  scene: ScaleSceneType;
  className?: string;
}

const SVG_W = 400;
const SVG_H = 290;
const FULCRUM_X = 200;
const FULCRUM_Y = 175;

const ScaleScene: React.FC<ScaleSceneProps> = ({ scene, className }) => {
  const { leftItems, rightItems, icon } = scene;
  const total = leftItems + rightItems;
  const ratio = total > 0 ? (leftItems - rightItems) / total : 0;
  const tiltAngle = ratio * 12;
  const Icon = SCENE_ICONS[icon] || SCENE_ICONS.ball;

  // Limit visible items
  const leftPos = useMemo(() => {
    const cols = Math.min(leftItems, 3);
    const rows = Math.ceil(leftItems / cols);
    const pos: Array<{ x: number; y: number; delay: number }> = [];
    for (let i = 0; i < Math.min(leftItems, 6); i++) {
      const c = i % cols, r = Math.floor(i / cols);
      pos.push({ x: 120 - 30 + c * 30, y: FULCRUM_Y + 50 + r * 32, delay: 0.3 + i * 0.08 });
    }
    return pos;
  }, [leftItems]);

  const rightPos = useMemo(() => {
    const cols = Math.min(rightItems, 3);
    const rows = Math.ceil(rightItems / cols);
    const pos: Array<{ x: number; y: number; delay: number }> = [];
    for (let i = 0; i < Math.min(rightItems, 6); i++) {
      const c = i % cols, r = Math.floor(i / cols);
      pos.push({ x: 280 + 30 - c * 30, y: FULCRUM_Y + 50 + r * 32, delay: 0.3 + i * 0.08 });
    }
    return pos;
  }, [rightItems]);

  const beamTransform = `rotate(${tiltAngle}, ${FULCRUM_X}, ${FULCRUM_Y})`;

  return (
    <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className={className}
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "auto", maxWidth: "420px", display: "block" }}
      preserveAspectRatio="xMidYMid meet"
    >
      {ICON_GRADIENTS}
      <defs>
        <filter id="sc-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="3" dy="4" stdDeviation="5" floodColor="rgba(0,0,0,0.1)" />
        </filter>
        <style>{`
          @keyframes sc-in {
            0% { opacity: 0; transform: rotate(0deg); }
            100% { opacity: 1; }
          }
          @keyframes sc-item-in {
            0% { transform: scale(0) translateY(8px); opacity: 0; }
            60% { transform: scale(1.1) translateY(-2px); opacity: 1; }
            100% { transform: scale(1) translateY(0); opacity: 1; }
          }
          .sc-in { animation: sc-in 0.5s ease-out both; }
          .sc-item { animation: sc-item-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
        `}</style>
      </defs>

      <rect width={SVG_W} height={SVG_H} fill="transparent" />
      <circle cx="100" cy="80" r="40" fill="rgba(255,107,53,0.03)" />
      <circle cx="300" cy="80" r="40" fill="rgba(0,184,148,0.03)" />

      {/* Beam */}
      <g className="sc-in" style={{ transformOrigin: `${FULCRUM_X}px ${FULCRUM_Y}px`, transform: beamTransform }}>
        {/* Beam bar */}
        <rect x={FULCRUM_X - 130} y={FULCRUM_Y - 6} width="260" height="12" rx="6"
          fill="#E6E6FA" stroke="#C8C8E0" strokeWidth="3" filter="url(#sc-shadow)" />
        {/* Left pan */}
        <rect x={FULCRUM_X - 120} y={FULCRUM_Y + 6} width="90" height="12" rx="6"
          fill="#FDBCB4" stroke="#E8A89E" strokeWidth="3" filter="url(#sc-shadow)" />
        {/* Right pan */}
        <rect x={FULCRUM_X + 30} y={FULCRUM_Y + 6} width="90" height="12" rx="6"
          fill="#ADD8E6" stroke="#8BB8CC" strokeWidth="3" filter="url(#sc-shadow)" />
      </g>

      {/* Fulcrum */}
      <polygon points={`${FULCRUM_X - 14},${FULCRUM_Y + 6} ${FULCRUM_X + 14},${FULCRUM_Y + 6} ${FULCRUM_X},${FULCRUM_Y - 14}`}
        fill="#E6E6FA" stroke="#C8C8E0" strokeWidth="3" strokeLinejoin="round" filter="url(#sc-shadow)" />
      <rect x={FULCRUM_X - 22} y={FULCRUM_Y + 6} width="44" height="22" rx="6"
        fill="#E6E6FA" stroke="#C8C8E0" strokeWidth="2.5" filter="url(#sc-shadow)" />

      {/* Left items */}
      {leftPos.map((pos, i) => (
        <g key={`l${i}`} className="sc-item" style={{ animationDelay: `${pos.delay}s` }}>
          <g filter="url(#sc-shadow)">
            <circle cx={pos.x} cy={pos.y} r="13" fill="#FDBCB4" stroke="#E8A89E" strokeWidth="2.5" />
            <circle cx={pos.x - 2} cy={pos.y - 2} r="6" fill="rgba(255,255,255,0.2)" />
          </g>
          <Icon size={18} />
        </g>
      ))}

      {/* Right items */}
      {rightPos.map((pos, i) => (
        <g key={`r${i}`} className="sc-item" style={{ animationDelay: `${pos.delay}s` }}>
          <g filter="url(#sc-shadow)">
            <circle cx={pos.x} cy={pos.y} r="13" fill="#ADD8E6" stroke="#8BB8CC" strokeWidth="2.5" />
            <circle cx={pos.x - 2} cy={pos.y - 2} r="6" fill="rgba(255,255,255,0.2)" />
          </g>
          <Icon size={18} />
        </g>
      ))}

      {/* Count labels */}
      <text x={FULCRUM_X - 75} y={FULCRUM_Y + 85}
        textAnchor="middle" fontSize="16" fontWeight="800"
        fill="rgba(200,100,90,0.5)" fontFamily="'Baloo 2', system-ui, sans-serif">{leftItems}</text>
      <text x={FULCRUM_X + 75} y={FULCRUM_Y + 85}
        textAnchor="middle" fontSize="16" fontWeight="800"
        fill="rgba(120,160,180,0.5)" fontFamily="'Baloo 2', system-ui, sans-serif">{rightItems}</text>
    </svg>
  );
};

export default ScaleScene;
