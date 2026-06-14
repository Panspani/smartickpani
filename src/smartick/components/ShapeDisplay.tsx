import React from "react";
import type { ShapeVisual } from "../engine/types";

interface ShapeDisplayProps {
  data: ShapeVisual;
}

const cx = 90;
const cy = 85;
const r = 65;

function getVertices(sides: number): Array<{ x: number; y: number }> {
  if (sides < 3) return [];
  return Array.from({ length: sides }, (_, i) => {
    const angle = (2 * Math.PI * i) / sides - Math.PI / 2;
    return {
      x: +(cx + r * Math.cos(angle)).toFixed(1),
      y: +(cy + r * Math.sin(angle)).toFixed(1),
    };
  });
}

function getEdgeMidpoints(
  sides: number
): Array<{ x: number; y: number }> {
  const verts = getVertices(sides);
  if (verts.length < 3) return [];
  return verts.map((v, i) => {
    const next = verts[(i + 1) % verts.length];
    return { x: +((v.x + next.x) / 2).toFixed(1), y: +((v.y + next.y) / 2).toFixed(1) };
  });
}

const ShapeDisplay: React.FC<ShapeDisplayProps> = ({ data }) => {
  const { shapeName, sides, showLabels, highlightProperty } = data;

  const vertices = getVertices(sides);
  const edgeMids = getEdgeMidpoints(sides);
  const points = vertices.map((v) => `${v.x},${v.y}`).join(" ");

  const renderShape = () => {
    if (sides === 0) {
      return (
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="#E8E8FF"
          stroke="var(--smartick-primary)"
          strokeWidth="3"
        />
      );
    }
    if (sides >= 3) {
      return (
        <polygon
          points={points}
          fill="#E8E8FF"
          stroke="var(--smartick-primary)"
          strokeWidth="3"
          strokeLinejoin="round"
        />
      );
    }
    return null;
  };

  const renderHighlights = () => {
    if (highlightProperty === "vertices") {
      return vertices.map((v, i) => (
        <circle
          key={`v-${i}`}
          cx={v.x}
          cy={v.y}
          r="6"
          fill="var(--smartick-primary)"
          stroke="#FFFFFF"
          strokeWidth="2"
        />
      ));
    }
    if (highlightProperty === "sides") {
      return edgeMids.map((m, i) => (
        <circle
          key={`s-${i}`}
          cx={m.x}
          cy={m.y}
          r="6"
          fill="#FD79A8"
          stroke="#FFFFFF"
          strokeWidth="2"
        />
      ));
    }
    if (highlightProperty === "symmetry") {
      if (sides === 0) return null;
      const count = sides;
      const lines: React.ReactNode[] = [];
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * i) / count;
        lines.push(
          <line
            key={`sym-${i}`}
            x1={+(cx - r * Math.cos(angle)).toFixed(1)}
            y1={+(cy - r * Math.sin(angle)).toFixed(1)}
            x2={+(cx + r * Math.cos(angle)).toFixed(1)}
            y2={+(cy + r * Math.sin(angle)).toFixed(1)}
            stroke="#A29BFE"
            strokeWidth="2"
            strokeDasharray="5,4"
            opacity="0.7"
          />
        );
      }
      return lines;
    }
    return null;
  };

  return (
    <div className="smartick-visual-shape">
      <svg viewBox="0 0 180 200" width="180" height="200">
        {renderShape()}
        {renderHighlights()}

        {showLabels && (
          <text
            x={90}
            y={185}
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily='"Baloo 2", sans-serif'
            fontSize="15"
            fontWeight="700"
            fill="#636E72"
          >
            {sides === 0 ? "círculo" : `${sides} ${sides === 1 ? "lado" : "lados"}`}
          </text>
        )}
      </svg>
    </div>
  );
};

export default ShapeDisplay;
