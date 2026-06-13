/**
 * StreakCalendar — Recent activity display.
 *
 * Shows the last 7 days as a row of icons:
 *   - Checkmark (✓) for days with practice
 *   - Cross (✗) for skipped days
 * Plus a "Racha: N días 🔥" counter and an encouraging message if empty.
 *
 * @module components/StreakCalendar
 */

import React, { useMemo } from "react";
import type { SessionResult } from "../engine/types";

export interface StreakCalendarProps {
  /** Number of consecutive days with activity. */
  streakDays: number;
  /** ISO date string of the last activity day. */
  lastActivityDate: string | null;
  /** All completed sessions (used to map activity dates). */
  sessions: SessionResult[];
}

interface DayInfo {
  date: Date;
  label: string;
  active: boolean;
  isToday: boolean;
}

/**
 * Build an array of the last 7 days with activity status.
 */
function buildLast7Days(
  lastActivityDate: string | null,
  sessions: SessionResult[],
): DayInfo[] {
  const activeDates = new Set<string>();

  // Collect all dates that have sessions
  for (const session of sessions) {
    const dateKey = session.date.split("T")[0];
    activeDates.add(dateKey);
  }

  // Also include lastActivityDate if not already in sessions
  if (lastActivityDate) {
    activeDates.add(lastActivityDate);
  }

  const days: DayInfo[] = [];
  const now = new Date();
  const dayNames = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    const dateKey = date.toISOString().split("T")[0];
    const isToday = i === 0;

    days.push({
      date,
      label: dayNames[date.getDay()],
      active: activeDates.has(dateKey),
      isToday,
    });
  }

  return days;
}

const StreakCalendar: React.FC<StreakCalendarProps> = ({
  streakDays,
  lastActivityDate,
  sessions,
}) => {
  const days = useMemo(
    () => buildLast7Days(lastActivityDate, sessions),
    [lastActivityDate, sessions],
  );

  const hasActivity = sessions.length > 0;

  return (
    <div className="smartick-streak-calendar">
      <h3 className="smartick-streak-calendar__title">
        Tu actividad
      </h3>

      {/* Streak counter */}
      {hasActivity && (
        <p className="smartick-streak-calendar__streak">
          Racha: {streakDays} días 🔥
        </p>
      )}

      {/* 7-day row */}
      <div className="smartick-streak-calendar__days" role="list" aria-label="Actividad de los últimos 7 días">
        {days.map((day) => {
          const dayClass = [
            "smartick-streak-calendar__day",
            day.active
              ? "smartick-streak-calendar__day--active"
              : "smartick-streak-calendar__day--inactive",
            day.isToday ? "smartick-streak-calendar__day--today" : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <div
              key={day.date.toISOString()}
              className={dayClass}
              role="listitem"
              aria-label={`${day.label}${day.isToday ? " (hoy)" : ""} - ${
                day.active ? "practicó" : "sin actividad"
              }`}
            >
              <span className="smartick-streak-calendar__day-label">
                {day.label}
              </span>
              <span className="smartick-streak-calendar__day-icon">
                {day.active ? "✓" : "✗"}
              </span>
            </div>
          );
        })}
      </div>

      {/* Encouraging message if empty */}
      {!hasActivity && (
        <p className="smartick-streak-calendar__empty-message">
          ¡Empezá tu primera sesión!
        </p>
      )}
    </div>
  );
};

export default StreakCalendar;
