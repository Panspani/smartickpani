/**
 * NumberLineScene — PRO SVG animated number line with jumps.
 *
 * Shows a horizontal number line with:
 * - Tick marks and numbers
 * - Animated jumping marker that moves step by step
 * - Direction arrow (forward/backward)
 *
 * Used for: skip counting, addition/subtraction on line, estimation.
 *
 * @module components/scenes/NumberLineScene
 */

import React, { useMemo } from "react";
import type { NumberLineScene as NumberLineSceneType } from "../../engine/scenes/types";

interface NumberLineSceneProps {
  scene: NumberLineSceneType;
  className?: string;
}

const SVG_W = 420;
const SVG_H = 180;
const LINE_Y = 100;
const LINE_START = 50;
const LINE_END = 370;
const LINE_LEN = LINE_END - LINE_START;
const TICK_SIZE = 10;

const NumberLineScene: React.FC<NumberLineSceneProps> = ({ scene, className }) => {
  const { start, jump, jumps, direction } = scene;
  const end = start + jump * jumps;
  const minVal = Math.min(start, end) - jump;
  const maxVal = Math.max(start, end) + jump;
  const range = maxVal - minVal;

  // Tick positions
  const ticks = useMemo(() => {
    const t: Array<{ value: number; x: number; isLandmark: boolean }> = [];
    for (let v = minVal; v <= maxVal; v += jump) {
      const x = LINE_START + ((v - minVal) / range) * LINE_LEN;
      t.push({
        value: v,
        x: Math.round(x),
        isLandmark: v === start || v === end,
      });
    }
    return t;
  }, [minVal, maxVal, range, jump]);

  // Jump segments
  const segments = useMemo(() => {
    const segs: Array<{ x1: number; x2: number; delay: number }> = [];
    for (let i = 0; i < jumps; i++) {
      const v = start + i * jump;
      const nextV = v + jump;
      const x1 = LINE_START + ((v - minVal) / range) * LINE_LEN;
      const x2 = LINE_START + ((nextV - minVal) / range) * LINE_LEN;
      segs.push({ x1: Math.round(x1), x2: Math.round(x2), delay: i * 0.3 });
    }
    return segs;
  }, [start, jumps, jump, minVal, range]);

  const arrowDir = direction === "forward" ? 1 : -1;
  const markerEndX = LINE_START + ((end - minVal) / range) * LINE_LEN;

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "auto", maxWidth: "440px", display: "block" }}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <filter id="nl-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <style>{`
          @keyframes nl-line-in {
            0% { stroke-dashoffset: 400; }
            100% { stroke-dashoffset: 0; }
          }
          @keyframes nl-jump {
            0% { opacity: 0; transform: translateY(8px); }
            60% { opacity: 1; transform: translateY(-2px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          @keyframes nl-bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
          }
          .nl-arc { animation: nl-line-in 0.6s ease-out both; }
          .nl-jump { animation: nl-jump 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
          .nl-bounce { animation: nl-bounce 2s ease-in-out infinite; }
        `}</style>
      </defs>

      {/* Background */}
      <rect width={SVG_W} height={SVG_H} fill="transparent" />
      <circle cx="80" cy="40" r="35" fill="rgba(116,185,255,0.04)" />
      <circle cx="340" cy="140" r="40" fill="rgba(0,184,148,0.04)" />

      {/* Main line */}
      <line
        x1={LINE_START}
        y1={LINE_Y}
        x2={LINE_END}
        y2={LINE_Y}
        stroke="rgba(255,255,255,0.15)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="400"
        className="nl-arc"
      />

      {/* Tick marks and labels */}
      {ticks.map((tick, i) => (
        <g key={i} className="nl-jump" style={{ animationDelay: `${0.1 + i * 0.08}s` }}>
          <line
            x1={tick.x}
            y1={LINE_Y - TICK_SIZE}
            x2={tick.x}
            y2={LINE_Y + TICK_SIZE}
            stroke={tick.isLandmark ? "#FF6B35" : "rgba(255,255,255,0.25)"}
            strokeWidth={tick.isLandmark ? 3 : 2}
            strokeLinecap="round"
          />
          <text
            x={tick.x}
            y={LINE_Y + TICK_SIZE + 16}
            textAnchor="middle"
            fontSize={tick.isLandmark ? "14" : "11"}
            fontWeight={tick.isLandmark ? "800" : "500"}
            fill={tick.isLandmark ? "#FF6B35" : "rgba(255,255,255,0.35)"}
            fontFamily="system-ui, sans-serif"
          >
            {tick.value}
          </text>
        </g>
      ))}

      {/* Jump arcs */}
      {segments.map((seg, i) => (
        <g key={i}>
          <path
            d={`M ${seg.x1} ${LINE_Y - 8} Q ${(seg.x1 + seg.x2) / 2} ${LINE_Y - 28} ${seg.x2} ${LINE_Y - 8}`}
            fill="none"
            stroke="#FF6B35"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.5"
            className="nl-jump"
            style={{ animationDelay: `${0.5 + seg.delay}s` }}
          />
          {/* Direction arrowhead */}
          <polygon
            points={`${seg.x2 + arrowDir * 8},${LINE_Y - 12} ${seg.x2 + arrowDir * 8},${LINE_Y - 4} ${seg.x2 + arrowDir * 14},${LINE_Y - 8}`}
            fill="#FF6B35"
            opacity="0.5"
            className="nl-jump"
            style={{ animationDelay: `${0.5 + seg.delay}s` }}
          />
          {/* Jump label */}
          <text
            x={(seg.x1 + seg.x2) / 2}
            y={LINE_Y - 30}
            textAnchor="middle"
            fontSize="11"
            fontWeight="700"
            fill="#FF6B35"
            opacity="0.6"
            fontFamily="system-ui, sans-serif"
            className="nl-jump"
            style={{ animationDelay: `${0.5 + seg.delay}s` }}
          >
            +{jump}
          </text>
        </g>
      ))}

      {/* Final marker */}
      <g className="nl-bounce" style={{ animationDelay: `${0.5 + segments.length * 0.3}s` }}>
        <circle
          cx={markerEndX}
          cy={LINE_Y}
          r="10"
          fill="#FF6B35"
          filter="url(#nl-glow)"
        />
        <text
          x={markerEndX}
          y={LINE_Y + 1}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="12"
          fontWeight="800"
          fill="#fff"
          fontFamily="system-ui, sans-serif"
        >
          {end}
        </text>
      </g>
    </svg>
  );
};

export default NumberLineScene;
