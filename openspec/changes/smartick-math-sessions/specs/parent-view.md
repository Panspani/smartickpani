# Parent View Specification

## Purpose

Define the parent-facing interface that displays session summaries, per-skill performance analytics, time metrics, and problematic-area highlights — enabling a parent to monitor Ana's progress and identify areas needing support.

## Requirements

### R1: Session Summary Card

The parent view MUST display a summary of the most recent session at the top of the page.

#### Scenario: Recent session summary card

- GIVEN Ana completed a session 10 minutes ago
- WHEN the parent navigates to the parent view
- THEN a summary card MUST appear at the top
- AND it MUST be visible without scrolling on desktop viewports (≥1024px)
- AND the card MUST show:
  - Date: "12/06/2026"
  - Duration: "15:00" (or actual completed duration)
  - Overall accuracy: "80%"
  - Stars earned: "24 ⭐"
  - Problems attempted: "15 problemas"
  - Skills practiced as pills/chips: "Multiplicación · División"

#### Scenario: Summary updates after session

- GIVEN Ana completes a new session
- WHEN the parent view is loaded or refreshed
- THEN the summary card MUST reflect the latest session data
- AND MUST NOT show stale data

#### Scenario: No sessions yet

- GIVEN Ana has not completed any sessions
- WHEN the parent view loads
- THEN the summary card MUST NOT appear
- AND a message SHOULD display: "Completa una sesión para ver el resumen"

### R2: Per-Skill Performance Breakdown

Below the session summary, the view MUST display a performance breakdown for each skill practiced in the last 30 days.

#### Scenario: Skill breakdown cards

- GIVEN Ana practiced multiplication and division in the last 7 days
- WHEN viewing the performance breakdown
- THEN two skill cards MUST display in a responsive grid
- AND each card MUST show:
  - Skill name (e.g., "Práctica de la multiplicación")
  - Accuracy percentage (e.g., "85%")
  - Average response time (e.g., "18s promedio")
  - Sessions practiced count (e.g., "4 sesiones")
  - Trend indicator (e.g., "↑ mejorando")

#### Scenario: Trend calculation rules

- GIVEN Ana's multiplication accuracy over last 3 sessions: 70%, 80%, 85%
- WHEN computing the trend indicator
- THEN the trend MUST show "↑ mejorando"
- GIVEN accuracy was 70%, 72%, 68% (all within ±5% of each other)
- THEN the trend MUST show "→ estable"
- GIVEN accuracy was 75%, 65%, 60% (monotonically decreasing)
- THEN the trend MUST show "↓ necesita práctica"

#### Scenario: Trend icon mapping

- "↑ mejorando" — green up arrow
- "→ estable" — gray horizontal arrow
- "↓ necesita práctica" — amber down arrow

### R3: Time Metrics

The view MUST display daily and weekly time metrics.

#### Scenario: Time metrics section

- GIVEN Ana practiced 15 minutes today and 45 minutes this week across 3 sessions
- WHEN viewing the time metrics section
- THEN display:
  - "Hoy: 15 min"
  - "Esta semana: 45 min · 3 sesiones"
  - "Promedio: 15 min por sesión"

#### Scenario: Weekly comparison

- GIVEN the system has data for the current week and the previous week
- WHEN displaying weekly metrics
- THEN the view SHOULD show a comparison: "Esta semana: 45 min · Semana pasada: 30 min"
- AND a directional arrow SHOULD indicate the change: "+50%" for increase, "−33%" for decrease

#### Scenario: No prior week data

- GIVEN this is the first week of usage (no previous week data)
- WHEN displaying weekly comparison
- THEN the comparison text SHOULD show "Semana pasada: —"
- AND no arrow indicator SHOULD appear

### R4: Problematic Areas Highlight

The view SHOULD highlight skills where accuracy is <60% or response time >30s, indicating areas needing parental support.

#### Scenario: Low-accuracy warning

- GIVEN division accuracy is 55% (below 60%)
- WHEN the skill breakdown renders
- THEN the division card MUST display an amber triangle warning icon (⚠️)
- AND a text label: "Necesita apoyo — practicar más la división"

#### Scenario: Slow-response warning

- GIVEN multiplication accuracy is 80% but average response time is 35s (above 30s)
- WHEN the skill breakdown renders
- THEN the multiplication card MUST display an amber warning
- AND the text label: "Necesita apoyo — responder con más rapidez"

#### Scenario: Dual warning

- GIVEN a skill has both low accuracy (<60%) AND slow response (>30s)
- WHEN the skill card renders
- THEN the card MUST display a single red warning icon (🔴)
- AND the label: "Necesita apoyo urgente"

#### Scenario: No warnings for healthy skills

- GIVEN all skills have accuracy ≥60% AND response time ≤30s
- WHEN the skill breakdown renders
- THEN NO warning indicators MUST appear on any skill card

#### Scenario: Collapsible warning list

- GIVEN there are 3 or more skills with warnings
- WHEN the parent view renders
- THEN a collapsible "Áreas que necesitan apoyo" section SHOULD appear at the top, below the summary card
- AND SHOULD list all flagged skills with their warnings

### R5: Parent Gate

Access to the parent view MUST be protected by a simple math challenge to prevent child access.

#### Scenario: Math challenge gate

- GIVEN Ana taps the "Vista de padres" button on the child dashboard
- WHEN the parent gate triggers
- THEN a modal or overlay MUST display with a simple addition problem
- AND the problem MUST be randomly generated with operands 3–20
- AND the input MUST be a numeric field

#### Scenario: Correct answer grants access

- GIVEN the challenge shows "¿Cuánto es 7 + 5?"
- WHEN the correct answer "12" is entered
- THEN the parent view MUST render
- AND the challenge modal MUST close

#### Scenario: Incorrect answer retries

- GIVEN the challenge shows "¿Cuánto es 7 + 5?"
- WHEN an incorrect answer is entered
- THEN the challenge MUST display a new random problem
- AND MUST NOT show the previous answer
- AND the parent view MUST remain hidden

#### Scenario: Dismiss gate without answering

- GIVEN the parent gate modal is displayed
- WHEN the user taps "Cancelar" or presses Escape
- THEN the modal MUST close
- AND the child dashboard MUST be visible again

### R6: Navigation and Layout

The parent view MUST include a way to return to the child dashboard.

#### Scenario: Back navigation

- GIVEN the parent view is displayed
- WHEN the parent taps "Volver al panel de Ana"
- THEN the child dashboard MUST render
- AND the parent gate MUST NOT appear again (already authenticated this session)

#### Scenario: Session-based authentication

- GIVEN the parent passed the gate earlier in this browser session
- WHEN navigating between child dashboard and parent view
- THEN the parent gate MUST NOT reappear
- UNTIL the page is fully reloaded

## Acceptance Criteria

- [ ] Session summary card shows latest session data (no-scroll on desktop)
- [ ] Per-skill breakdown cards: name, accuracy %, avg response time, session count, trend
- [ ] Trend calculated from last 3 sessions: improving (↑), stable (→), needs-practice (↓)
- [ ] Time metrics: today, this week (with comparison to last week), average
- [ ] Warning indicators: amber for accuracy <60% or response >30s, red for both
- [ ] Math-challenge parent gate with random operand 3–20
- [ ] Session-based auth: no gate after first pass until page reload
- [ ] "Volver al panel de Ana" navigation button
