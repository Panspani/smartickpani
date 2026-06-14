/**
 * GeometryScene — PRO SVG shape visualization.
 *
 * Renders geometric shapes (triangle, square, circle, etc.) with
 * labeled vertices/sides and clean styling.
 *
 * @module components/scenes/GeometryScene
 */

import React from "react";
import type { ShapeScene } from "../../engine/scenes/geometry";

interface GeometrySceneProps {
  scene: ShapeScene;
  className?: string;
}

const SVG_W = 300;
const SVG_H = 280;

// Shape path generators centered at (150, 140)
function shapePath(shape: string): string {
  const cx = 150, cy = 140, r = 90;
  switch (shape) {
    case "triangle": {
      // Regular triangle pointing up
      const pts = [
        [cx, cy - r],
        [cx - r * Math.cos(Math.PI / 6), cy + r * Math.sin(Math.PI / 6)],
        [cx + r * Math.cos(Math.PI / 6), cy + r * Math.sin(Math.PI / 6)],
      ];
      return pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`).join(" ") + " Z";
    }
    case "square":
      return `M ${cx - r} ${cy - r} L ${cx + r} ${cy - r} L ${cx + r} ${cy + r} L ${cx - r} ${cy + r} Z`;
    case "rectangle":
      return `M ${cx - r * 1.15} ${cy - r * 0.7} L ${cx + r * 1.15} ${cy - r * 0.7} L ${cx + r * 1.15} ${cy + r * 0.7} L ${cx - r * 1.15} ${cy + r * 0.7} Z`;
    case "circle":
      return `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r} Z`;
    case "pentagon": {
      const pts: number[][] = [];
      for (let i = 0; i < 5; i++) {
        const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
        pts.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)]);
      }
      return pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`).join(" ") + " Z";
    }
    case "hexagon": {
      const pts: number[][] = [];
      for (let i = 0; i < 6; i++) {
        const angle = (i * 2 * Math.PI) / 6 - Math.PI / 2;
        pts.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)]);
      }
      return pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`).join(" ") + " Z";
    }
    default:
      return "";
  }
}

// Vertex label positions
function vertexLabels(shape: string): Array<{ x: number; y: number; label: string }> {
  const cx = 150, cy = 140, r = 90;
  const labels = ["A", "B", "C", "D", "E", "F"];
  const verts: Array<{ x: number; y: number; label: string }> = [];
  let count = 0;

  switch (shape) {
    case "triangle":
      count = 3;
      break;
    case "square":
    case "rectangle":
      count = 4;
      break;
    case "pentagon":
      count = 5;
      break;
    case "hexagon":
      count = 6;
      break;
    default:
      return [];
  }

  for (let i = 0; i < count; i++) {
    const angle = (i * 2 * Math.PI) / count - Math.PI / 2;
    verts.push({
      x: cx + (r + 24) * Math.cos(angle),
      y: cy + (r + 24) * Math.sin(angle),
      label: labels[i],
    });
  }
  return verts;
}

const GeometryScene: React.FC<GeometrySceneProps> = ({ scene, className }) => {
  const path = shapePath(scene.shape);
  const labels = vertexLabels(scene.shape);
  const shapeName = scene.shape.charAt(0).toUpperCase() + scene.shape.slice(1);

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "auto", maxWidth: "320px", display: "block" }}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <filter id="ge-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="rgba(0,0,0,0.12)" />
        </filter>
        <style>{`
          @keyframes ge-in {
            0% { transform: scale(0.8) rotate(-10deg); opacity: 0; }
            60% { transform: scale(1.05) rotate(2deg); opacity: 1; }
            100% { transform: scale(1) rotate(0deg); opacity: 1; }
          }
          @keyframes ge-label-in {
            0% { opacity: 0; transform: scale(0); }
            100% { opacity: 1; transform: scale(1); }
          }
          .ge-shape { animation: ge-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
          .ge-label { animation: ge-label-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
        `}</style>
      </defs>

      {/* Background */}
      <rect width={SVG_W} height={SVG_H} fill="transparent" />
      <circle cx="60" cy="50" r="35" fill={`${scene.color}08`} />
      <circle cx="240" cy="230" r="40" fill={`${scene.color}06`} />

      {/* Shape */}
      <g className="ge-shape" filter="url(#ge-shadow)">
        <path
          d={path}
          fill={`${scene.color}15`}
          stroke={scene.color}
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {/* Interior glow */}
        <path
          d={path}
          fill="none"
          stroke={`${scene.color}40`}
          strokeWidth="1"
          strokeLinejoin="round"
          transform="scale(0.92) translate(12, 11)"
        />
      </g>

      {/* Vertex labels */}
      {labels.map((v, i) => (
        <g key={i} className="ge-label" style={{ animationDelay: `${0.3 + i * 0.08}s` }}>
          <circle cx={v.x} cy={v.y} r="10" fill={`${scene.color}15`} stroke={scene.color} strokeWidth="1.5" />
          <text
            x={v.x}
            y={v.y + 1}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="12"
            fontWeight="800"
            fill={scene.color}
            fontFamily="system-ui, sans-serif"
          >
            {v.label}
          </text>
        </g>
      ))}

      {/* Shape name label */}
      <text
        x={SVG_W / 2}
        y={SVG_H - 20}
        textAnchor="middle"
        fontSize="15"
        fontWeight="700"
        fill="rgba(255,255,255,0.4)"
        fontFamily="system-ui, sans-serif"
      >
        {shapeName}
      </text>
    </svg>
  );
};

export default GeometryScene;
