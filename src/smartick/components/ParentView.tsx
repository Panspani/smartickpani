/**
 * ParentView — Parent analytics view.
 *
 * Provides comprehensive session analytics:
 *   - Session summary card: date, duration, stars, accuracy
 *   - Per-skill breakdown with trend indicators (↑↓→ from last 3 sessions)
 *   - Time metrics (avg time per problem)
 *   - Warning zones (skills below 40% in amber/red)
 *   - Session history table: last 10 sessions, paginated, with drill-down
 *
 * @module components/ParentView
 */

import React, { useState, useMemo, useCallback } from "react";
import type { SessionResult, SkillId } from "../engine/types";
import { SKILL_DEFINITIONS } from "../engine/skill-map";
import { useStorage } from "../hooks/useStorage";
import { computeStars } from "../engine/scoring";

export interface ParentViewProps {
  /** Callback to navigate back to the dashboard. */
  onBack: () => void;
}

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

type Trend = "up" | "down" | "stable";

interface SkillAnalytics {
  id: SkillId;
  name: string;
  masteryPercentage: number;
  accuracy: number;
  trend: Trend;
  sessionsPracticed: number;
}

// ──────────────────────────────────────────────
// Helper: determine trend
// ──────────────────────────────────────────────

function computeTrend(
  sessions: SessionResult[],
  skillId: SkillId,
): Trend {
  const relevant = sessions
    .filter((s) => s.skillsPracticed.includes(skillId))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  if (relevant.length < 2) return "stable";

  // Compare last vs second-to-last accuracy for this skill
  const lastSessionAccuracy = getSkillAccuracy(relevant[0], skillId);
  const prevSessionAccuracy = getSkillAccuracy(relevant[1], skillId);

  const diff = lastSessionAccuracy - prevSessionAccuracy;
  if (diff > 5) return "up";
  if (diff < -5) return "down";
  return "stable";
}

function getSkillAccuracy(session: SessionResult, skillId: SkillId): number {
  const skillProblems = session.problems.filter(
    (p) => p.problem.skillId === skillId,
  );
  if (skillProblems.length === 0) return 0;
  const correct = skillProblems.filter((p) => p.isCorrect).length;
  return Math.round((correct / skillProblems.length) * 100);
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

const TREND_ICON: Record<Trend, string> = {
  up: "↑",
  down: "↓",
  stable: "→",
};

const TREND_CLASS: Record<Trend, string> = {
  up: "smartick-parent-view__trend--up",
  down: "smartick-parent-view__trend--down",
  stable: "smartick-parent-view__trend--stable",
};

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

const PAGE_SIZE = 10;

const ParentView: React.FC<ParentViewProps> = ({ onBack }) => {
  const storage = useStorage();
  const [page, setPage] = useState(0);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  // Session analytics
  const latestSession = useMemo(
    () =>
      storage.sessions.length > 0
        ? storage.sessions[storage.sessions.length - 1]
        : null,
    [storage.sessions],
  );

  // Skill breakdown
  const skillAnalytics: SkillAnalytics[] = useMemo(
    () =>
      SKILL_DEFINITIONS.map((def) => {
        const skill = storage.skillState[def.id];
        const accuracy = skill
          ? Math.round(
              skill.subSkills.reduce((sum, s) => sum + s.accuracy, 0) /
                Math.max(skill.subSkills.length, 1),
            )
          : 0;

        return {
          id: def.id,
          name: def.name,
          masteryPercentage: skill?.masteryPercentage ?? 0,
          accuracy,
          trend: computeTrend(storage.sessions, def.id),
          sessionsPracticed: storage.sessions.filter((s) =>
            s.skillsPracticed.includes(def.id),
          ).length,
        };
      }),
    [storage.skillState, storage.sessions],
  );

  // Warning zones (skills below 40%)
  const warningSkills = useMemo(
    () =>
      skillAnalytics
        .filter((s) => s.masteryPercentage < 40 && s.sessionsPracticed > 0)
        .sort((a, b) => a.masteryPercentage - b.masteryPercentage),
    [skillAnalytics],
  );

  // Average response time across all sessions
  const avgResponseTime = useMemo(() => {
    const allProblems = storage.sessions.flatMap((s) => s.problems);
    const withTime = allProblems.filter((p) => p.responseTimeMs !== null);
    if (withTime.length === 0) return 0;
    return (
      withTime.reduce((sum, p) => sum + p.responseTimeMs!, 0) /
      withTime.length /
      1000
    );
  }, [storage.sessions]);

  // Today's stats
  const todayStr = new Date().toISOString().split("T")[0];
  const todaySessions = useMemo(
    () => storage.sessions.filter((s) => s.date.startsWith(todayStr)),
    [storage.sessions, todayStr],
  );

  const todayAvgResponse = useMemo(() => {
    const problems = todaySessions.flatMap((s) => s.problems);
    const withTime = problems.filter((p) => p.responseTimeMs !== null);
    if (withTime.length === 0) return 0;
    return (
      withTime.reduce((sum, p) => sum + p.responseTimeMs!, 0) /
      withTime.length /
      1000
    );
  }, [todaySessions]);

  // Paginated session history
  const totalPages = Math.max(
    1,
    Math.ceil(storage.sessions.length / PAGE_SIZE),
  );
  const paginatedSessions = useMemo(
    () =>
      [...storage.sessions]
        .reverse()
        .slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE),
    [storage.sessions, page],
  );

  const goNextPage = useCallback(
    () => setPage((p) => Math.min(p + 1, totalPages - 1)),
    [totalPages],
  );
  const goPrevPage = useCallback(
    () => setPage((p) => Math.max(p - 1, 0)),
    [],
  );

  const toggleSessionExpand = useCallback((id: string) => {
    setExpandedSession((prev) => (prev === id ? null : id));
  }, []);

  const currentPage = page + 1;

  return (
    <div className="smartick-parent-view">
      <div className="smartick-parent-view__header">
        <h1 className="smartick-parent-view__title">Panel de padres</h1>
        <button
          className="smartick-parent-view__back-button"
          onClick={onBack}
          type="button"
        >
          ← Volver
        </button>
      </div>

      {/* ── Latest Session Summary ─────────────── */}
      {latestSession && (
        <section className="smartick-parent-view__card">
          <h2 className="smartick-parent-view__card-title">
            Última sesión
          </h2>
          <p className="smartick-parent-view__card-date">
            {formatDate(latestSession.date)} a las{" "}
            {formatTime(latestSession.date)}
          </p>
          <div className="smartick-parent-view__summary-grid">
            <div className="smartick-parent-view__summary-item">
              <span className="smartick-parent-view__summary-label">
                Duración
              </span>
              <span className="smartick-parent-view__summary-value">
                {formatDuration(latestSession.durationSeconds)}
              </span>
            </div>
            <div className="smartick-parent-view__summary-item">
              <span className="smartick-parent-view__summary-label">
                Estrellas
              </span>
              <span className="smartick-parent-view__summary-value">
                {computeStars(
                  latestSession.problems.filter((p) => p.isCorrect).length,
                  latestSession.problems.length,
                  latestSession.streakMax,
                )}{" "}
                / 3
              </span>
            </div>
            <div className="smartick-parent-view__summary-item">
              <span className="smartick-parent-view__summary-label">
                Precisión
              </span>
              <span className="smartick-parent-view__summary-value">
                {latestSession.accuracy}%
              </span>
            </div>
            <div className="smartick-parent-view__summary-item">
              <span className="smartick-parent-view__summary-label">
                Problemas
              </span>
              <span className="smartick-parent-view__summary-value">
                {latestSession.problems.length}
              </span>
            </div>
          </div>
        </section>
      )}

      {/* ── Time Metrics ───────────────────────── */}
      <section className="smartick-parent-view__card">
        <h2 className="smartick-parent-view__card-title">
          Tiempos de respuesta
        </h2>
        <div className="smartick-parent-view__metrics-grid">
          <div className="smartick-parent-view__metric">
            <span className="smartick-parent-view__metric-label">Hoy</span>
            <span className="smartick-parent-view__metric-value">
              {todayAvgResponse > 0
                ? `${todayAvgResponse.toFixed(1)}s`
                : "—"}
            </span>
          </div>
          <div className="smartick-parent-view__metric">
            <span className="smartick-parent-view__metric-label">
              Total (promedio)
            </span>
            <span className="smartick-parent-view__metric-value">
              {avgResponseTime > 0
                ? `${avgResponseTime.toFixed(1)}s`
                : "—"}
            </span>
          </div>
          <div className="smartick-parent-view__metric">
            <span className="smartick-parent-view__metric-label">
              Sesiones hoy
            </span>
            <span className="smartick-parent-view__metric-value">
              {todaySessions.length}
            </span>
          </div>
          <div className="smartick-parent-view__metric">
            <span className="smartick-parent-view__metric-label">
              Total sesiones
            </span>
            <span className="smartick-parent-view__metric-value">
              {storage.sessions.length}
            </span>
          </div>
        </div>
      </section>

      {/* ── Warning Zones ──────────────────────── */}
      {warningSkills.length > 0 && (
        <section className="smartick-parent-view__card smartick-parent-view__card--warning">
          <h2 className="smartick-parent-view__card-title">
            Habilidades con dificultad ({warningSkills.length})
          </h2>
          <ul className="smartick-parent-view__warning-list">
            {warningSkills.map((skill) => (
              <li
                key={skill.id}
                className={`smartick-parent-view__warning-item ${
                  skill.masteryPercentage < 20
                    ? "smartick-parent-view__warning-item--critical"
                    : ""
                }`}
              >
                <span className="smartick-parent-view__warning-name">
                  {skill.name}
                </span>
                <span className="smartick-parent-view__warning-value">
                  {skill.masteryPercentage}%
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── Per-Skill Breakdown ────────────────── */}
      <section className="smartick-parent-view__card">
        <h2 className="smartick-parent-view__card-title">
          Desglose por habilidad
        </h2>
        <div className="smartick-parent-view__skills-list">
          {skillAnalytics.map((skill) => (
            <div
              key={skill.id}
              className={`smartick-parent-view__skill-row ${
                skill.masteryPercentage < 40
                  ? "smartick-parent-view__skill-row--warning"
                  : ""
              }`}
            >
              <div className="smartick-parent-view__skill-info">
                <span className="smartick-parent-view__skill-name">
                  {skill.name}
                </span>
                <span className="smartick-parent-view__skill-sessions">
                  {skill.sessionsPracticed} sesiones
                </span>
              </div>
              <div className="smartick-parent-view__skill-metrics">
                <span
                  className={`smartick-parent-view__trend ${
                    TREND_CLASS[skill.trend]
                  }`}
                  aria-label={`Tendencia: ${skill.trend}`}
                >
                  {TREND_ICON[skill.trend]}
                </span>
                <span className="smartick-parent-view__skill-accuracy">
                  {skill.masteryPercentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Session History Table ──────────────── */}
      <section className="smartick-parent-view__card">
        <h2 className="smartick-parent-view__card-title">
          Historial de sesiones
        </h2>

        {storage.sessions.length === 0 ? (
          <p className="smartick-parent-view__empty">
            No hay sesiones registradas todavía.
          </p>
        ) : (
          <>
            <div className="smartick-parent-view__table-wrapper">
              <table className="smartick-parent-view__table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Hora</th>
                    <th>Duración</th>
                    <th>Precisión</th>
                    <th>Estrellas</th>
                    <th>Problemas</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedSessions.map((session) => {
                    const starRating = computeStars(
                      session.problems.filter((p) => p.isCorrect).length,
                      session.problems.length,
                      session.streakMax,
                    );
                    const isExpanded = expandedSession === session.id;

                    return (
                      <React.Fragment key={session.id}>
                        <tr
                          className="smartick-parent-view__table-row"
                          onClick={() => toggleSessionExpand(session.id)}
                        >
                          <td>{formatDate(session.date)}</td>
                          <td>{formatTime(session.date)}</td>
                          <td>{formatDuration(session.durationSeconds)}</td>
                          <td>{session.accuracy}%</td>
                          <td>{starRating} / 3</td>
                          <td>{session.problems.length}</td>
                          <td>
                            <span className="smartick-parent-view__expand-icon">
                              {isExpanded ? "▲" : "▼"}
                            </span>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr className="smartick-parent-view__table-detail">
                            <td colSpan={7}>
                              <div className="smartick-parent-view__session-detail">
                                <p>
                                  <strong>Racha máxima:</strong>{" "}
                                  {session.streakMax}
                                </p>
                                <p>
                                  <strong>Habilidades practicadas:</strong>{" "}
                                  {session.skillsPracticed
                                    .map(
                                      (id) =>
                                        SKILL_DEFINITIONS.find(
                                          (d) => d.id === id,
                                        )?.name ?? id,
                                    )
                                    .join(", ")}
                                </p>
                                <p>
                                  <strong>Fases completadas:</strong>{" "}
                                  {[
                                    session.phasesCompleted.warmup
                                      ? "calentamiento"
                                      : null,
                                    session.phasesCompleted.core
                                      ? "núcleo"
                                      : null,
                                    session.phasesCompleted.cooldown
                                      ? "enfriamiento"
                                      : null,
                                  ]
                                    .filter(Boolean)
                                    .join(", ") || "ninguna"}
                                </p>
                                {session.badgesEarned.length > 0 && (
                                  <p>
                                    <strong>Medallas obtenidas:</strong>{" "}
                                    {session.badgesEarned
                                      .map((b) => b.name)
                                      .join(", ")}
                                  </p>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="smartick-parent-view__pagination">
              <button
                className="smartick-parent-view__page-button"
                onClick={goPrevPage}
                disabled={page === 0}
                type="button"
              >
                ← Anterior
              </button>
              <span className="smartick-parent-view__page-info">
                Página {currentPage} de {totalPages}
              </span>
              <button
                className="smartick-parent-view__page-button"
                onClick={goNextPage}
                disabled={page >= totalPages - 1}
                type="button"
              >
                Siguiente →
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default ParentView;
