/**
 * BadgeDisplay — Achievement badges grid.
 *
 * Displays all badges in a grid layout:
 *   - Earned badges: full color with name
 *   - Unearned badges: subtle shimmer/gray (placeholder)
 *
 * Shows the 4 badges defined in scoring.ts / types.ts.
 *
 * @module components/BadgeDisplay
 */

import React from "react";
import type { Badge } from "../engine/types";
import { BADGE_DEFINITIONS } from "../engine/types";

export interface BadgeDisplayProps {
  /** All earned badges (with earnedAt dates). */
  allBadges: Badge[];
  /** Recently earned badges (shown first / highlighted). */
  recentBadges?: Badge[];
}

// All badge definitions in display order
const ALL_BADGE_DEFS = [
  BADGE_DEFINITIONS.FIRST_SESSION,
  BADGE_DEFINITIONS.STREAK_5_DAYS,
  BADGE_DEFINITIONS.SPEED_DEMON,
  BADGE_DEFINITIONS.MASTER_MATHEMATICIAN,
];

const BadgeDisplay: React.FC<BadgeDisplayProps> = ({
  allBadges,
  recentBadges = [],
}) => {
  const earnedIds = new Set(allBadges.map((b) => b.id));
  const recentIds = new Set(recentBadges.map((b) => b.id));

  return (
    <div className="smartick-badge-display">
      <h3 className="smartick-badge-display__title">Medallas</h3>

      <div
        className="smartick-badge-display__grid"
        role="list"
        aria-label="Medallas obtenidas"
      >
        {ALL_BADGE_DEFS.map((def) => {
          const isEarned = earnedIds.has(def.id);
          const isRecent = recentIds.has(def.id);

          const className = [
            "smartick-badge-display__badge",
            isEarned
              ? "smartick-badge-display__badge--earned"
              : "smartick-badge-display__badge--unearned",
            isRecent ? "smartick-badge-display__badge--recent" : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <div
              key={def.id}
              className={className}
              role="listitem"
              aria-label={`${def.name}: ${isEarned ? "obtenida" : "no obtenida"}`}
            >
              <div className="smartick-badge-display__badge-icon">
                {isEarned ? "🏅" : "○"}
              </div>
              <span className="smartick-badge-display__badge-name">
                {def.name}
              </span>
              {isEarned && (
                <span className="smartick-badge-display__badge-description">
                  {def.description}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BadgeDisplay;
