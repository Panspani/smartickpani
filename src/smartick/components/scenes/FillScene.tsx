/**
 * FillScene — CLAYMORPHISM PRO SVG container filling scene.
 *
 * Chunky jar with 3D depth, double shadows, pastel liquid gradient.
 *
 * @module components/scenes/FillScene
 */

import React from "react";
import type { FillScene as FillSceneType } from "../../engine/scenes/types";
import { ICON_GRADIENTS } from "./SceneIcons";

interface FillSceneProps {
  scene: FillSceneType;
  className?: string;
}

const SVG_W = 260;
const SVG_H = 320;
const JAR_X = 80;
const JAR_W = 100;
const JAR_H = 200;
const JAR_Y = 60;
const RADIUS = 14;

const FillScene: React.FC<FillSceneProps> = ({ scene, className }) => {
  const { totalCapacity, currentFill, unit, containerLabel, icon } = scene;
  const pct = Math.min(currentFill / totalCapacity, 1);
  const fillH = pct * (JAR_H - 24);
  const fillY = JAR_Y + JAR_H - 12 - fillH;
  const liquidColor = pct > 0.6 ? "#74B9FF" : pct > 0.25 ? "#55EFC4" : "#FFEAA7";
  const liquidDark = pct > 0.6 ? "#5499E8" : pct > 0.25 ? "#38C8A0" : "#E8D08A";

  const marks = [0, 0.25, 0.5, 0.75, 1].map(p => ({
    y: JAR_Y + JAR_H - 12 - p * (JAR_H - 24),
    label: `${Math.round(p * totalCapacity)}`,
  }));

  return (
    <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className={className}
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "auto", maxWidth: "280px", display: "block" }}
      preserveAspectRatio="xMidYMid meet"
    >
      {ICON_GRADIENTS}
      <defs>
        <linearGradient id="liq" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={liquidColor} stopOpacity="0.6" />
          <stop offset="100%" stopColor={liquidDark} stopOpacity="0.3" />
        </linearGradient>
        <filter id="f-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="4" dy="5" stdDeviation="5" floodColor="rgba(0,0,0,0.12)" />
        </filter>
        <style>{`
          @keyframes f-fill-up {
            0% { height: 0; y: ${JAR_Y + JAR_H - 12}; }
          }
          @keyframes f-wave {
            0%, 100% { transform: translateX(-3px); }
            50% { transform: translateX(3px); }
          }
          @keyframes f-bubble {
            0%, 100% { opacity: 0; transform: translateY(0) scale(0.5); }
            50% { opacity: 0.4; transform: translateY(-8px) scale(1); }
          }
          .f-fill { animation: f-fill-up 0.8s cubic-bezier(0.34, 1.2, 0.64, 1) both; }
          .f-wave { animation: f-wave 2.5s ease-in-out infinite; }
          .f-bubble { animation: f-bubble 1.5s ease-in-out infinite; }
        `}</style>
      </defs>

      <rect width={SVG_W} height={SVG_H} fill="transparent" />
      <circle cx="130" cy="40" r="30" fill={`${liquidColor}10`} />

      {/* Label */}
      <text x={SVG_W / 2} y="32" textAnchor="middle" fontSize="15" fontWeight="800"
        fill="rgba(49,46,129,0.4)" fontFamily="'Baloo 2', system-ui, sans-serif">
        {containerLabel}
      </text>

      {/* Measurement marks */}
      {marks.map((m, i) => (
        <g key={i}>
          <line x1={JAR_X + JAR_W + 6} y1={m.y} x2={JAR_X + JAR_W + 16} y2={m.y}
            stroke="rgba(49,46,129,0.15)" strokeWidth="2" strokeLinecap="round" />
          <text x={JAR_X + JAR_W + 22} y={m.y + 4}
            textAnchor="start" fontSize="10" fontWeight="600"
            fill="rgba(49,46,129,0.25)" fontFamily="system-ui, sans-serif">
            {m.label}{unit}
          </text>
        </g>
      ))}

      {/* Jar shadow */}
      <rect x={JAR_X + 4} y={JAR_Y + 6} width={JAR_W} height={JAR_H} rx={RADIUS}
        fill="rgba(0,0,0,0.06)" />
      {/* Jar body */}
      <rect x={JAR_X} y={JAR_Y} width={JAR_W} height={JAR_H} rx={RADIUS} ry={RADIUS}
        fill="rgba(255,255,255,0.06)" stroke="rgba(49,46,129,0.12)" strokeWidth="3" />
      {/* Jar neck */}
      <rect x={JAR_X + 28} y={JAR_Y - 12} width={JAR_W - 56} height="16" rx="5"
        fill="transparent" stroke="rgba(49,46,129,0.12)" strokeWidth="3" />

      {/* Liquid fill */}
      <g className="f-fill">
        <rect x={JAR_X + 6} y={fillY} width={JAR_W - 12} height={fillH} rx={6}
          fill="url(#liq)" />
        {/* Wave surface */}
        <path d={`M ${JAR_X + 6} ${fillY + 3} Q ${JAR_X + JAR_W / 4} ${fillY - 4}, ${JAR_X + JAR_W / 2} ${fillY + 3} Q ${JAR_X + (3 * JAR_W) / 4} ${fillY + 8}, ${JAR_X + JAR_W - 6} ${fillY + 3} L ${JAR_X + JAR_W - 6} ${fillY + 8} L ${JAR_X + 6} ${fillY + 8} Z`}
          fill={liquidColor} opacity="0.25" className="f-wave" />
      </g>

      {/* Bubbles */}
      <circle cx={JAR_X + 30} cy={JAR_Y + JAR_H - 50} r="3.5" fill="rgba(255,255,255,0.2)" className="f-bubble" />
      <circle cx={JAR_X + JAR_W - 30} cy={JAR_Y + JAR_H - 80} r="2.5" fill="rgba(255,255,255,0.15)" className="f-bubble" style={{ animationDelay: "0.5s" }} />

      {/* Value */}
      <text x={SVG_W / 2} y={JAR_Y + JAR_H + 40}
        textAnchor="middle" fontSize="18" fontWeight="800"
        fill="rgba(49,46,129,0.4)" fontFamily="'Baloo 2', system-ui, sans-serif">
        {currentFill}{unit}
      </text>
    </svg>
  );
};

export default FillScene;
