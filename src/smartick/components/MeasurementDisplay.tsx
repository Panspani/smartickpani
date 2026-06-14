import React from "react";
import type { MeasurementVisual } from "../engine/types";

interface MeasurementDisplayProps {
  data: MeasurementVisual;
}

const MeasurementDisplay: React.FC<MeasurementDisplayProps> = ({
  data,
}) => {
  const { kind, value, unit, maxValue, showMarker } = data;

  // --- RULER ---
  if (kind === "ruler") {
    const rulerX = 20;
    const rulerY = 55;
    const rulerW = 160;
    const rulerH = 30;
    const tickCount = Math.min(maxValue, 20);
    const tickSpacing = rulerW / tickCount;
    const valuePos = maxValue > 0 ? (value / maxValue) * rulerW : 0;

    return (
      <div className="smartick-visual-measurement">
        <svg viewBox="0 0 200 130" width="200" height="130">
          {/* Ruler body */}
          <rect
            x={rulerX}
            y={rulerY}
            width={rulerW}
            height={rulerH}
            rx="4"
            fill="#FFF8E1"
            stroke="#FDCB6E"
            strokeWidth="2"
          />

          {/* Tick marks */}
          {Array.from({ length: tickCount + 1 }, (_, i) => {
            const tx = rulerX + i * tickSpacing;
            const isMajor = i % 5 === 0 || i === 0 || i === tickCount;
            const tickH = isMajor ? 16 : 8;
            const labelY = isMajor ? tickH + 6 : undefined;

            return (
              <g key={i}>
                <line
                  x1={tx}
                  y1={rulerY + rulerH}
                  x2={tx}
                  y2={rulerY + rulerH - tickH}
                  stroke="#636E72"
                  strokeWidth={isMajor ? "2" : "1.5"}
                />
                {isMajor && (
                  <text
                    x={tx}
                    y={rulerY + rulerH + labelY!}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontFamily='"Baloo 2", sans-serif'
                    fontSize="11"
                    fontWeight="700"
                    fill="#636E72"
                  >
                    {i * (maxValue / tickCount)}
                  </text>
                )}
              </g>
            );
          })}

          {/* Red marker */}
          {showMarker && (
            <g>
              <line
                x1={rulerX + valuePos}
                y1={rulerY - 8}
                x2={rulerX + valuePos}
                y2={rulerY + rulerH + 4}
                stroke="#FF7675"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <polygon
                points={`${rulerX + valuePos - 6},${rulerY - 8} ${rulerX + valuePos + 6},${rulerY - 8} ${rulerX + valuePos},${rulerY - 16}`}
                fill="#FF7675"
              />
              <text
                x={rulerX + valuePos}
                y={rulerY - 24}
                textAnchor="middle"
                dominantBaseline="central"
                fontFamily='"Baloo 2", sans-serif'
                fontSize="13"
                fontWeight="800"
                fill="#FF7675"
              >
                {value}
                {unit}
              </text>
            </g>
          )}

          {/* Unit label */}
          <text
            x={100}
            y={120}
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily='"Baloo 2", sans-serif'
            fontSize="14"
            fontWeight="600"
            fill="#636E72"
          >
            {unit}
          </text>
        </svg>
      </div>
    );
  }

  // --- JUG (beaker) ---
  if (kind === "jug") {
    const jugLeft = 60;
    const jugRight = 140;
    const jugTop = 30;
    const jugBottom = 125;
    const jugW = jugRight - jugLeft;
    const jugH = jugBottom - jugTop;

    const fillRatio = maxValue > 0 ? Math.min(value / maxValue, 1) : 0;
    const waterHeight = fillRatio * jugH;
    const waterTop = jugBottom - waterHeight;

    return (
      <div className="smartick-visual-measurement">
        <svg viewBox="0 0 200 145" width="200" height="145">
          {/* Jug outline (trapezoid) */}
          <polygon
            points={`${jugLeft},${jugTop} ${jugRight},${jugTop} ${jugRight + 8},${jugBottom} ${jugLeft - 8},${jugBottom}`}
            fill="#F8F9FF"
            stroke="var(--smartick-primary)"
            strokeWidth="3"
            strokeLinejoin="round"
          />

          {/* Water fill */}
          <polygon
            points={`${jugLeft - 7},${jugBottom} ${jugRight + 7},${jugBottom} ${jugRight + 7},${waterTop} ${jugLeft - 7},${waterTop}`}
            fill="#74B9FF"
            opacity="0.6"
          />

          {/* Water surface */}
          <line
            x1={jugLeft - 7}
            y1={waterTop}
            x2={jugRight + 7}
            y2={waterTop}
            stroke="#74B9FF"
            strokeWidth="2.5"
            opacity="0.9"
          />

          {/* Measurement lines on side */}
          {[0.25, 0.5, 0.75].map((ratio) => {
            const ly = jugBottom - ratio * jugH;
            return (
              <line
                key={ratio}
                x1={jugRight + 10}
                y1={ly}
                x2={jugRight + 22}
                y2={ly}
                stroke="#A29BFE"
                strokeWidth="1.5"
                strokeDasharray="3,2"
              />
            );
          })}

          {/* Value label */}
          <text
            x={100}
            y={waterTop - 10}
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily='"Baloo 2", sans-serif'
            fontSize="16"
            fontWeight="800"
            fill="#2D3436"
          >
            {value}
            <tspan fontSize="13" fontWeight="600" fill="#636E72">
              {" "}{unit}
            </tspan>
          </text>
        </svg>
      </div>
    );
  }

  // --- SCALE (digital display) ---
  if (kind === "scale") {
    return (
      <div className="smartick-visual-measurement">
        <svg viewBox="0 0 200 130" width="200" height="130">
          {/* Scale platform */}
          <rect
            x="30"
            y="95"
            width="140"
            height="12"
            rx="4"
            fill="#E8E8FF"
            stroke="var(--smartick-primary)"
            strokeWidth="2"
          />

          {/* Scale base */}
          <rect
            x="50"
            y="65"
            width="100"
            height="32"
            rx="6"
            fill="#FFFFFF"
            stroke="#A29BFE"
            strokeWidth="2"
          />

          {/* Digital display */}
          <rect
            x="60"
            y="50"
            width="80"
            height="40"
            rx="6"
            fill="#F0EEFF"
            stroke="var(--smartick-primary)"
            strokeWidth="2.5"
          />

          {/* Value */}
          <text
            x={100}
            y={65}
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily='"Baloo 2", sans-serif'
            fontSize="28"
            fontWeight="800"
            fill="var(--smartick-primary)"
          >
            {value}
          </text>

          {/* Unit */}
          <text
            x={100}
            y={90}
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily='"Baloo 2", sans-serif'
            fontSize="16"
            fontWeight="700"
            fill="#636E72"
          >
            {unit}
          </text>
        </svg>
      </div>
    );
  }

  return null;
};

export default MeasurementDisplay;
