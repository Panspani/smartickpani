import React, { useState, useCallback, useEffect } from "react";
import type { ClockVisual } from "../engine/types";

export interface ClockDisplayProps {
  data: ClockVisual;
  /** When true, user can tap to cycle the hour hand. */
  interactive?: boolean;
  /** Called when user selects an hour in interactive mode. */
  onHourSelect?: (selectedHour: number) => void;
  /** The correct hour for visual feedback (green/red). Only used in interactive mode. */
  correctHour?: number;
}

const ClockDisplay: React.FC<ClockDisplayProps> = ({
  data,
  interactive = false,
  onHourSelect,
  correctHour,
}) => {
  const { hour, minute, showNumbers } = data;

  // Interactive mode: track selected hour locally
  const [selectedHour, setSelectedHour] = useState<number>(hour);
  const [showFeedback, setShowFeedback] = useState<"correct" | "incorrect" | null>(null);

  const effectiveHour = interactive ? selectedHour : hour;

  // Reset local state when data prop changes (new problem)
  useEffect(() => {
    if (interactive) {
      setSelectedHour(hour);
      setShowFeedback(null);
    }
  }, [hour, minute, interactive]);

  const cx = 100;
  const cy = 100;
  const r = 85;

  const numbers = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

  // Hand angles — hour hand uses rotation transform for smooth CSS transition
  const hourAngleDeg = (effectiveHour % 12) * 30 + minute * 0.5;
  const minuteAngleDeg = minute * 6;

  const hourLen = 42;
  const minuteLen = 62;

  const toRad = (deg: number) => ((deg - 90) * Math.PI) / 180;

  const minuteX = cx + minuteLen * Math.cos(toRad(minuteAngleDeg));
  const minuteY = cy + minuteLen * Math.sin(toRad(minuteAngleDeg));

  // 60 tick marks
  const ticks = Array.from({ length: 60 }, (_, i) => {
    const angle = (i * 6 - 90) * (Math.PI / 180);
    const isHour = i % 5 === 0;
    const innerR = isHour ? r - 16 : r - 10;
    const outerR = r - 6;
    return (
      <line
        key={i}
        x1={cx + innerR * Math.cos(angle)}
        y1={cy + innerR * Math.sin(angle)}
        x2={cx + outerR * Math.cos(angle)}
        y2={cy + outerR * Math.sin(angle)}
        stroke={isHour ? "var(--smartick-primary)" : "#D0D0E0"}
        strokeWidth={isHour ? 2.5 : 1}
      />
    );
  });

  // Hour numbers
  const hourNumbers = showNumbers
    ? numbers.map((num, i) => {
        const angle = (i * 30 - 90) * (Math.PI / 180);
        const numR = r - 25;
        return (
          <text
            key={num}
            x={cx + numR * Math.cos(angle)}
            y={cy + numR * Math.sin(angle)}
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily='"Baloo 2", sans-serif'
            fontSize="15"
            fontWeight="700"
            fill="#2D3436"
          >
            {num}
          </text>
        );
      })
    : null;

  // ── Interactive mode handler ──────────────────

  const handleClockTap = useCallback(() => {
    if (!interactive) return;

    // Cycle hour: 1→2→...→12→1
    const nextHour = (effectiveHour % 12) + 1;
    setSelectedHour(nextHour);
    setShowFeedback(null);

    if (onHourSelect) {
      onHourSelect(nextHour);
    }

    // If correctHour is set, show feedback
    if (correctHour !== undefined) {
      if (nextHour === correctHour) {
        setShowFeedback("correct");
      } else {
        setShowFeedback("incorrect");
      }
    }
  }, [interactive, effectiveHour, onHourSelect, correctHour]);

  // ── Interactive: show selected hour label ─────

  const containerClassName = interactive
    ? "smartick-visual-clock smartick-clock-display--interactive"
    : "smartick-visual-clock";

  return (
    <div className={containerClassName}>
      <svg
        viewBox="0 0 200 200"
        width="200"
        height="200"
        onClick={handleClockTap}
        style={interactive ? { cursor: "pointer" } : undefined}
      >
        {/* Clock face */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="#FFFFFF"
          stroke="var(--smartick-primary-light)"
          strokeWidth="4"
        />

        {/* Tick marks */}
        {ticks}

        {/* Hour numbers */}
        {hourNumbers}

        {/* Hour hand — uses CSS transition when interactive */}
        <g
          className={interactive ? "smartick-clock-display__hour-hand" : undefined}
          style={{
            transformOrigin: `${cx}px ${cy}px`,
            transform: `rotate(${hourAngleDeg}deg)`,
          }}
        >
          <line
            x1={cx}
            y1={cy}
            x2={cx}
            y2={cy - hourLen}
            stroke="#2D3436"
            strokeWidth="5"
            strokeLinecap="round"
          />
        </g>

        {/* Minute hand */}
        <line
          x1={cx}
          y1={cy}
          x2={minuteX}
          y2={minuteY}
          stroke="var(--smartick-primary)"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Center cap */}
        <circle cx={cx} cy={cy} r="6" fill="var(--smartick-primary)" />
        <circle cx={cx} cy={cy} r="2.5" fill="#FFFFFF" />
      </svg>

      {/* Interactive: hour label + feedback */}
      {interactive && (
        <>
          <div className="smartick-clock-display__hour-label">
            Hora: {effectiveHour}:00
          </div>
          {showFeedback === "correct" && (
            <div className="smartick-clock-display__feedback smartick-clock-display__feedback--correct">
              ✅ ¡Correcto!
            </div>
          )}
          {showFeedback === "incorrect" && correctHour !== undefined && (
            <div className="smartick-clock-display__feedback smartick-clock-display__feedback--incorrect">
              ❌ La hora era {correctHour}:00
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ClockDisplay;
