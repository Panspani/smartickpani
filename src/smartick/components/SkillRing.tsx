/**
 * SkillRing — SVG circular progress indicator for a skill.
 *
 * Features:
 *   - SVG circle with stroke-dashoffset for fill percentage
 *   - Color bands: red (0–39%), yellow (40–69%), green (70–99%), star (100%)
 *   - Animated fill transition via CSS transition
 *   - Sub-skill breakdown on tap (expandable list)
 *   - Skill name inside the ring
 *
 * @module components/SkillRing
 */

import React, { useState, useCallback } from "react";

export interface SubSkillInfo {
  name: string;
  accuracy: number;
  mastered: boolean;
}

export interface SkillRingProps {
  /** The display name of the skill. */
  name: string;
  /** Mastery percentage (0–100). */
  percentage: number;
  /** Sub-skill breakdown (shown on expand). */
  subSkills: SubSkillInfo[];
}

// SVG constants
const RADIUS = 40;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const STROKE_WIDTH = 8;
const VIEWBOX_SIZE = 100;

/**
 * Determine the ring color based on the mastery percentage.
 */
function getRingColor(pct: number): string {
  if (pct >= 100) return "var(--smartick-star, #f39c12)";
  if (pct >= 70) return "var(--smartick-ring-green, #2ecc71)";
  if (pct >= 40) return "var(--smartick-ring-yellow, #f1c40f)";
  return "var(--smartick-ring-red, #e74c3c)";
}

const SkillRing: React.FC<SkillRingProps> = ({
  name,
  percentage,
  subSkills,
}) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  // The offset decreases as percentage increases (stroke-dashoffset)
  const offset = CIRCUMFERENCE - (percentage / 100) * CIRCUMFERENCE;
  const color = getRingColor(percentage);
  const isComplete = percentage >= 100;

  return (
    <div className="smartick-skill-ring">
      <button
        className="smartick-skill-ring__trigger"
        onClick={toggleExpand}
        type="button"
        aria-expanded={expanded}
        aria-label={`${name}: ${percentage}% dominado`}
      >
        <svg
          className="smartick-skill-ring__svg"
          viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
          aria-hidden="true"
        >
          {/* Background circle */}
          <circle
            className="smartick-skill-ring__bg"
            cx={VIEWBOX_SIZE / 2}
            cy={VIEWBOX_SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="var(--smartick-ring-bg, #e0e0e0)"
            strokeWidth={STROKE_WIDTH}
          />

          {/* Progress circle */}
          <circle
            className="smartick-skill-ring__progress"
            cx={VIEWBOX_SIZE / 2}
            cy={VIEWBOX_SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={color}
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${VIEWBOX_SIZE / 2} ${VIEWBOX_SIZE / 2})`}
            style={{
              transition: "stroke-dashoffset 0.8s ease-in-out",
            }}
          />

          {/* Completion star */}
          {isComplete && (
            <text
              x={VIEWBOX_SIZE / 2}
              y={VIEWBOX_SIZE / 2 + 5}
              textAnchor="middle"
              fontSize="24"
              fill="var(--smartick-star, #f39c12)"
            >
              ★
            </text>
          )}
        </svg>

        {/* Percentage label */}
        <span className="smartick-skill-ring__percentage">
          {percentage}%
        </span>

        {/* Skill name */}
        <span className="smartick-skill-ring__name">{name}</span>
      </button>

      {/* Expanded sub-skill breakdown */}
      {expanded && subSkills.length > 0 && (
        <div className="smartick-skill-ring__subskills">
          <ul className="smartick-skill-ring__subskills-list">
            {subSkills.map((sub) => (
              <li
                key={sub.name}
                className={`smartick-skill-ring__subskill ${
                  sub.mastered
                    ? "smartick-skill-ring__subskill--mastered"
                    : ""
                }`}
              >
                <span className="smartick-skill-ring__subskill-name">
                  {sub.name}
                </span>
                <span className="smartick-skill-ring__subskill-accuracy">
                  {sub.accuracy}%
                </span>
                {sub.mastered && (
                  <span
                    className="smartick-skill-ring__subskill-check"
                    aria-label="Dominado"
                  >
                    ✓
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SkillRing;
