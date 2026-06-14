import React from "react";
import type { BalanceVisual } from "../engine/types";

interface BalanceDisplayProps {
  data: BalanceVisual;
}

const BalanceDisplay: React.FC<BalanceDisplayProps> = ({ data }) => {
  const { leftLabel, rightLabel, leftValue, rightValue, item } = data;

  const isUnknown = rightValue === -1;

  // Tilt: positive = left heavier (rotates clockwise)
  let tiltDeg = 0;
  if (!isUnknown) {
    if (leftValue > rightValue) tiltDeg = 8;
    else if (rightValue > leftValue) tiltDeg = -8;
    else tiltDeg = 0;
  }

  const pivotX = 125;
  const pivotY = 88;

  return (
    <div className="smartick-visual-balance">
      <svg viewBox="0 0 250 145" width="250" height="145">
        {/* Fulcrum (triangle) */}
        <polygon
          points="105,140 145,140 125,88"
          fill="var(--smartick-primary)"
          stroke="#5A4BD1"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Beam + pans group — rotated around pivot */}
        <g transform={`rotate(${tiltDeg}, ${pivotX}, ${pivotY})`}>
          {/* Beam */}
          <line
            x1="25"
            y1={pivotY}
            x2="225"
            y2={pivotY}
            stroke="var(--smartick-primary)"
            strokeWidth="6"
            strokeLinecap="round"
          />

          {/* Left chain */}
          <line
            x1="40"
            y1={pivotY}
            x2="40"
            y2={pivotY + 28}
            stroke="#A29BFE"
            strokeWidth="2.5"
          />
          {/* Left pan */}
          <rect
            x="15"
            y={pivotY + 28}
            width="50"
            height="20"
            rx="4"
            fill="#E8E8FF"
            stroke="var(--smartick-primary)"
            strokeWidth="2"
          />

          {/* Right chain */}
          <line
            x1="210"
            y1={pivotY}
            x2="210"
            y2={pivotY + 28}
            stroke="#A29BFE"
            strokeWidth="2.5"
          />
          {/* Right pan */}
          <rect
            x="185"
            y={pivotY + 28}
            width="50"
            height="20"
            rx="4"
            fill={isUnknown ? "#FFF5EE" : "#E8E8FF"}
            stroke="var(--smartick-primary)"
            strokeWidth="2"
          />

          {/* Left label */}
          <text
            x="40"
            y={pivotY + 38}
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily='"Baloo 2", sans-serif'
            fontSize="13"
            fontWeight="700"
            fill="#2D3436"
          >
            {leftLabel}
          </text>

          {/* Right label */}
          <text
            x="210"
            y={pivotY + 38}
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily='"Baloo 2", sans-serif'
            fontSize="13"
            fontWeight="700"
            fill={isUnknown ? "#FF7675" : "#2D3436"}
          >
            {isUnknown ? "?" : rightLabel}
          </text>
        </g>

        {/* Item label below */}
        <text
          x={125}
          y={110}
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily='"Baloo 2", sans-serif'
          fontSize="14"
          fontWeight="600"
          fill="#636E72"
        >
          {item}
        </text>
      </svg>
    </div>
  );
};

export default BalanceDisplay;
