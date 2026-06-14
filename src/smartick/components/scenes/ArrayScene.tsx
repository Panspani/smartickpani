/**
 * ArrayScene — CLAYMORPHISM PRO SVG grid visualization.
 *
 * Soft 3D chunky grid cells with double shadows, thick borders,
 * pastel gradient palette, bouncy entrance animations.
 *
 * @module components/scenes/ArrayScene
 */

import React, { useMemo } from "react";
import type { ArrayScene as ArraySceneType } from "../../engine/scenes/types";
import { SCENE_ICONS, ICON_GRADIENTS } from "./SceneIcons";

interface ArraySceneProps {
  scene: ArraySceneType;
  className?: string;
}

const SVG_W = 400;
const SVG_H = 280;
const MAX_COLS = 8;

const CELL_COLORS = [
  { fill: "#FDBCB4", border: "#E8A89E", shadow: "rgba(200,140,130,0.3)" },
  { fill: "#ADD8E6", border: "#8BB8CC", shadow: "rgba(120,160,180,0.3)" },
  { fill: "#98FF98", border: "#78D88A", shadow: "rgba(100,190,120,0.3)" },
  { fill: "#E6E6FA", border: "#C8C8E0", shadow: "rgba(160,160,200,0.3)" },
  { fill: "#FFEAA7", border: "#E8D08A", shadow: "rgba(200,180,100,0.3)" },
  { fill: "#FFD0D0", border: "#E8B0B0", shadow: "rgba(200,140,140,0.3)" },
  { fill: "#B8F0E0", border: "#90D8C0", shadow: "rgba(120,200,170,0.3)" },
  { fill: "#D4D0FF", border: "#B8B0E8", shadow: "rgba(160,150,200,0.3)" },
];

const ICON_NAMES = ["star", "apple", "cookie", "ball", "book", "flower", "candy", "pencil"];

function calcPositions(scene: ArraySceneType) {
  const { rows, cols } = scene;
  const actualCols = Math.min(cols, MAX_COLS);
  const size = Math.min(34, (SVG_W - 60) / actualCols);
  const gap = 10;
  const totalW = actualCols * (size + gap) - gap;
  const totalH = rows * (size + gap) - gap;
  const sx = (SVG_W - totalW) / 2;
  const sy = (SVG_H - totalH) / 2 - 10;

  const positions: Array<{ x: number; y: number; delay: number; color: typeof CELL_COLORS[number]; iconName: string }> = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < actualCols; c++) {
      const idx = r * actualCols + c;
      positions.push({
        x: sx + c * (size + gap) + size / 2,
        y: sy + r * (size + gap) + size / 2,
        delay: 0.04 * idx,
        color: CELL_COLORS[idx % CELL_COLORS.length],
        iconName: ICON_NAMES[idx % ICON_NAMES.length],
      });
    }
  }
  return { positions, size };
}

const ArrayScene: React.FC<ArraySceneProps> = ({ scene, className }) => {
  const { positions, size } = useMemo(() => calcPositions(scene), [scene]);
  const iconSize = Math.round(size * 0.45);

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "auto", maxWidth: "420px", display: "block" }}
      preserveAspectRatio="xMidYMid meet"
    >
      {ICON_GRADIENTS}
      <defs>
        <style>{`
          @keyframes a-cell-in {
            0% { transform: scale(0) rotate(-20deg); opacity: 0; }
            60% { transform: scale(1.08) rotate(3deg); opacity: 1; }
            100% { transform: scale(1) rotate(0deg); opacity: 1; }
          }
          .a-cell { animation: a-cell-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
        `}</style>
      </defs>

      {/* Background */}
      <rect width={SVG_W} height={SVG_H} fill="transparent" />
      <circle cx="80" cy="60" r="45" fill="rgba(79,70,229,0.03)" />
      <circle cx="320" cy="220" r="50" fill="rgba(0,184,148,0.03)" />

      {/* Count label */}
      <text x={SVG_W / 2} y="32"
        textAnchor="middle" fontSize="14" fontWeight="800"
        fill="rgba(49,46,129,0.4)" fontFamily="'Baloo 2', system-ui, sans-serif">
        {scene.rows} × {scene.cols}
      </text>

      {/* Grid items */}
      {positions.map((pos, i) => {
        const Icon = SCENE_ICONS[pos.iconName] || SCENE_ICONS.star;
        return (
          <g key={i} className="a-cell" style={{ animationDelay: `${pos.delay}s` }}>
            {/* Shadow */}
            <rect x={pos.x - size / 2 + 2} y={pos.y - size / 2 + 3}
              width={size} height={size} rx="10"
              fill={pos.color.shadow} opacity="0.4" />
            {/* Cell body */}
            <rect x={pos.x - size / 2} y={pos.y - size / 2}
              width={size} height={size} rx="10"
              fill={pos.color.fill}
              stroke={pos.color.border}
              strokeWidth="3" />
            {/* Inner highlight */}
            <rect x={pos.x - size / 2 + 3} y={pos.y - size / 2 + 3}
              width={size - 6} height={(size - 6) * 0.4} rx="6"
              fill="rgba(255,255,255,0.2)" />
            {/* Icon */}
            <g transform={`translate(${pos.x - iconSize / 2}, ${pos.y - iconSize / 2})`}>
              <Icon size={iconSize} />
            </g>
          </g>
        );
      })}
    </svg>
  );
};

export default ArrayScene;
