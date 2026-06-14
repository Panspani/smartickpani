import React from "react";
import type { SolidVisual } from "../engine/types";

interface SolidDisplayProps {
  data: SolidVisual;
}

const SolidDisplay: React.FC<SolidDisplayProps> = ({ data }) => {
  const { solidName, vertices, edges, faces } = data;

  const renderSolidSVG = () => {
    const name = solidName.toLowerCase();

    // --- PRISMA TRIANGULAR ---
    if (name.includes("triangular")) {
      return (
        <g>
          {/* Back triangle */}
          <polygon
            points="60,55 105,30 145,65"
            fill="#D0D0F0"
            stroke="var(--smartick-primary)"
            strokeWidth="2.5"
          />
          {/* Connecting lines */}
          <line x1="60" y1="55" x2="40" y2="95" stroke="var(--smartick-primary)" strokeWidth="2.5" />
          <line x1="105" y1="30" x2="90" y2="70" stroke="var(--smartick-primary)" strokeWidth="2.5" />
          <line x1="145" y1="65" x2="125" y2="100" stroke="var(--smartick-primary)" strokeWidth="2.5" />
          {/* Front triangle */}
          <polygon
            points="40,95 90,70 125,100"
            fill="#E8E8FF"
            stroke="var(--smartick-primary)"
            strokeWidth="3"
          />
        </g>
      );
    }

    // --- CUBO / PRISMA CUADRANGULAR ---
    if (
      name.includes("cuadrangular") ||
      name.includes("cubo") ||
      name === "prisma cuadrangular" ||
      name === "cubo"
    ) {
      return (
        <g>
          {/* Back face */}
          <rect
            x="60"
            y="35"
            width="80"
            height="60"
            fill="#D0D0F0"
            stroke="var(--smartick-primary)"
            strokeWidth="2.5"
          />
          {/* Connecting lines */}
          <line x1="60" y1="35" x2="40" y2="65" stroke="var(--smartick-primary)" strokeWidth="2.5" />
          <line x1="140" y1="35" x2="120" y2="65" stroke="var(--smartick-primary)" strokeWidth="2.5" />
          <line x1="60" y1="95" x2="40" y2="115" stroke="var(--smartick-primary)" strokeWidth="2.5" />
          <line x1="140" y1="95" x2="120" y2="115" stroke="var(--smartick-primary)" strokeWidth="2.5" />
          {/* Front face */}
          <rect
            x="40"
            y="65"
            width="80"
            height="50"
            rx="2"
            fill="#E8E8FF"
            stroke="var(--smartick-primary)"
            strokeWidth="3"
          />
        </g>
      );
    }

    // --- PRISMA PENTAGONAL ---
    if (name.includes("pentagonal")) {
      const frontPts = [
        [90, 45],
        [135, 65],
        [120, 110],
        [60, 110],
        [45, 65],
      ];
      const backPts = [
        [105, 30],
        [150, 50],
        [135, 95],
        [75, 95],
        [60, 50],
      ];

      const connectLines = frontPts.map((fp, i) => (
        <line
          key={`pc-${i}`}
          x1={fp[0]}
          y1={fp[1]}
          x2={backPts[i][0]}
          y2={backPts[i][1]}
          stroke="var(--smartick-primary)"
          strokeWidth="2"
        />
      ));

      return (
        <g>
          {/* Back pentagon */}
          <polygon
            points={backPts.map((p) => p.join(",")).join(" ")}
            fill="#D0D0F0"
            stroke="var(--smartick-primary)"
            strokeWidth="2.5"
          />
          {connectLines}
          {/* Front pentagon */}
          <polygon
            points={frontPts.map((p) => p.join(",")).join(" ")}
            fill="#E8E8FF"
            stroke="var(--smartick-primary)"
            strokeWidth="3"
            strokeLinejoin="round"
          />
        </g>
      );
    }

    // --- PIRÁMIDE CUADRANGULAR ---
    if (name.includes("pirámide") && !name.includes("triangular")) {
      return (
        <g>
          {/* Base */}
          <polygon
            points="40,110 140,110 140,130 40,130"
            fill="#D0D0F0"
            stroke="var(--smartick-primary)"
            strokeWidth="2.5"
          />
          {/* Edges to apex */}
          <line x1="40" y1="110" x2="90" y2="45" stroke="var(--smartick-primary)" strokeWidth="2.5" />
          <line x1="140" y1="110" x2="90" y2="45" stroke="var(--smartick-primary)" strokeWidth="2.5" />
          <line x1="140" y1="130" x2="90" y2="45" stroke="var(--smartick-primary)" strokeWidth="2.5" />
          <line x1="40" y1="130" x2="90" y2="45" stroke="var(--smartick-primary)" strokeWidth="2.5" />
          {/* Front face */}
          <polygon
            points="40,110 90,45 140,110"
            fill="#E8E8FF"
            stroke="var(--smartick-primary)"
            strokeWidth="3"
            strokeLinejoin="round"
          />
        </g>
      );
    }

    // --- PIRÁMIDE TRIANGULAR (TETRAHEDRON) ---
    if (name.includes("triangular") || name.includes("tetraedro")) {
      return (
        <g>
          {/* Back edges */}
          <line x1="130" y1="115" x2="90" y2="35" stroke="var(--smartick-primary)" strokeWidth="2.5" />
          <line x1="50" y1="115" x2="90" y2="35" stroke="var(--smartick-primary)" strokeWidth="2.5" />
          {/* Base */}
          <line x1="50" y1="115" x2="130" y2="115" stroke="var(--smartick-primary)" strokeWidth="2.5" />
          {/* Front faces */}
          <polygon
            points="90,35 130,115 50,115"
            fill="#E8E8FF"
            stroke="var(--smartick-primary)"
            strokeWidth="3"
            strokeLinejoin="round"
          />
        </g>
      );
    }

    // --- CILINDRO ---
    if (name.includes("cilindro")) {
      return (
        <g>
          {/* Body */}
          <rect
            x="50"
            y="70"
            width="80"
            height="55"
            fill="#E8E8FF"
            stroke="var(--smartick-primary)"
            strokeWidth="2.5"
          />
          {/* Bottom ellipse */}
          <ellipse
            cx="90"
            cy="125"
            rx="40"
            ry="12"
            fill="#E8E8FF"
            stroke="var(--smartick-primary)"
            strokeWidth="2.5"
          />
          {/* Top ellipse */}
          <ellipse
            cx="90"
            cy="70"
            rx="40"
            ry="12"
            fill="#FFFFFF"
            stroke="var(--smartick-primary)"
            strokeWidth="3"
          />
        </g>
      );
    }

    // --- CONO ---
    if (name.includes("cono")) {
      return (
        <g>
          {/* Body */}
          <polygon
            points="90,40 50,105 130,105"
            fill="#E8E8FF"
            stroke="var(--smartick-primary)"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          {/* Base ellipse */}
          <ellipse
            cx="90"
            cy="105"
            rx="40"
            ry="12"
            fill="#E8E8FF"
            stroke="var(--smartick-primary)"
            strokeWidth="3"
          />
        </g>
      );
    }

    // --- ESFERA ---
    if (name.includes("esfera")) {
      return (
        <g>
          {/* Main sphere */}
          <circle
            cx="90"
            cy="90"
            r="45"
            fill="#E8E8FF"
            stroke="var(--smartick-primary)"
            strokeWidth="3"
          />
          {/* Shading arc 1 */}
          <ellipse
            cx="90"
            cy="90"
            rx="30"
            ry="10"
            fill="none"
            stroke="#A29BFE"
            strokeWidth="2"
            strokeDasharray="25,15"
            opacity="0.5"
          />
          {/* Shading arc 2 */}
          <ellipse
            cx="90"
            cy="90"
            rx="10"
            ry="25"
            fill="none"
            stroke="#A29BFE"
            strokeWidth="2"
            strokeDasharray="15,20"
            opacity="0.4"
          />
          {/* Highlight */}
          <ellipse
            cx="75"
            cy="75"
            rx="8"
            ry="5"
            fill="rgba(255,255,255,0.45)"
            transform="rotate(-30, 75, 75)"
          />
        </g>
      );
    }

    // Fallback — sphere-like
    return (
      <circle
        cx="90"
        cy="95"
        r="45"
        fill="#E8E8FF"
        stroke="var(--smartick-primary)"
        strokeWidth="3"
      />
    );
  };

  return (
    <div className="smartick-visual-solid">
      <div className="smartick-solid-content">
        <svg viewBox="0 0 180 170" width="180" height="170">
          {renderSolidSVG()}
        </svg>
        <div className="smartick-solid-labels">
          <span className="smartick-solid-label">
            <span
              className="smartick-solid-dot"
              style={{ backgroundColor: "var(--smartick-primary)" }}
            />
            {" "}{vertices} vértices
          </span>
          <span className="smartick-solid-label">
            <span
              className="smartick-solid-dot"
              style={{ backgroundColor: "#A29BFE" }}
            />
            {" "}{edges} aristas
          </span>
          <span className="smartick-solid-label">
            <span
              className="smartick-solid-dot"
              style={{ backgroundColor: "#FD79A8" }}
            />
            {" "}{faces} caras
          </span>
        </div>
      </div>
    </div>
  );
};

export default SolidDisplay;
