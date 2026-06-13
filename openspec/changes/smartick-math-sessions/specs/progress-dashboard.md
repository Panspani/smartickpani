# Progress Dashboard Specification

## Purpose

Define the skill progress visualization for Ana (child view with circular progress rings) and the detailed session history for parents (table with drill-down), enabling both child and parent to track mastery over time.

## Requirements

### R1: Child View — Skill Progress Rings

The child dashboard MUST display all unlocked skills in a visual grid. Each skill SHALL show a circular progress ring indicating mastery percentage (0–100%).

#### Scenario: Unlocked skills displayed

- GIVEN Ana has unlocked skills skill-05 through skill-08 (4 skills)
- WHEN viewing the child dashboard
- THEN exactly 4 skill rings MUST display in a grid layout
- AND each ring MUST show the skill name and mastery percentage
- AND locked skills MUST NOT appear (or appear grayed with a lock icon)

#### Scenario: Color-coded mastery bands

- GIVEN skill-05 is at 25% mastery, skill-06 at 55%, skill-07 at 85%, skill-08 at 100%
- WHEN the dashboard renders
- THEN skill-05 ring MUST be red (0–39%)
- AND skill-06 ring MUST be yellow (40–69%)
- AND skill-07 ring MUST be green (70–99%)
- AND skill-08 ring MUST be fully filled green with a star icon at 100%

#### Scenario: Ring animation on first view

- GIVEN the child dashboard loads for the first time
- WHEN skill rings render
- THEN each ring SHOULD animate from 0 to its current percentage over 1 second
- AND the percentage number SHOULD count up during the animation

#### Scenario: Ring shows sub-skill breakdown on tap

- GIVEN Ana taps a skill ring
- WHEN the ring is tapped
- THEN a sub-skill breakdown SHOULD expand below or as a tooltip
- AND each sub-skill SHALL show: name, mastered/unmastered badge, accuracy %, and last-practiced date

### R2: Child View — Session Streak Calendar

The child dashboard SHOULD display the last 7 days of activity. Each day SHALL show whether a session was completed.

#### Scenario: 7-day activity display

- GIVEN Ana completed sessions Monday through Wednesday, skipped Thursday, completed Friday
- WHEN viewing the child dashboard (current day is Saturday)
- THEN a 7-day row MUST show: Mon ✅, Tue ✅, Wed ✅, Thu —, Fri ✅, Sat — (today not yet done)
- AND completed days SHALL display a green checkmark or filled circle
- AND missed days SHALL display a gray dash or empty circle

#### Scenario: Streak counter

- GIVEN Ana completed sessions for 3 consecutive days (including today)
- WHEN viewing the child dashboard
- THEN a "Racha: 3 días 🔥" counter MUST display prominently above or beside the calendar

#### Scenario: Empty week

- GIVEN Ana has not completed any sessions in the last 7 days
- WHEN viewing the child dashboard
- THEN all 7 days SHALL show gray dashes
- AND the streak counter MUST show "Racha: 0 días"
- AND an encouraging message SHOULD appear: "¿Practicamos hoy?"

### R3: Child View — Navigation to Parent View

The child dashboard MUST include a button to access the parent view.

#### Scenario: Parent view button

- GIVEN the child dashboard is displayed
- WHEN inspecting navigation options
- THEN a button labeled "Vista de padres" or with a lock icon MUST be visible
- AND tapping it SHOULD trigger the parent gate challenge
- AND SHALL NOT navigate directly to the parent view without passing the gate

### R4: Parent View — Detailed Session History

The parent view (accessible after passing the parent gate) MUST render a paginated table of all sessions sorted by date descending.

#### Scenario: Session history table

- GIVEN Ana has completed 7 sessions
- WHEN the parent views the session history
- THEN a table MUST display with rows sorted by date descending (most recent first)
- AND each row MUST show:
  - Date (e.g., "12/06/2026")
  - Duration completed (e.g., "15:00" or "12:30")
  - Skills practiced (e.g., "Multiplicación, División")
  - Accuracy % (e.g., "80%")
  - Stars earned (e.g., "24 ⭐")
  - Problems attempted (e.g., "15")

#### Scenario: Pagination

- GIVEN Ana has completed 25 sessions
- WHEN the parent view loads
- THEN the table MUST show at most 10 rows per page
- AND pagination controls MUST appear: "Anterior" and "Siguiente" buttons
- AND the current page indicator MUST show (e.g., "Página 1 de 3")

#### Scenario: Empty history state

- GIVEN Ana has not completed any sessions
- WHEN the parent views the session history
- THEN a centered message MUST display: "Aún no hay sesiones completadas"
- AND the table area MUST be empty (no headers or rows)

### R5: Parent View — Per-Session Drill-Down

Each session row MUST be expandable to show per-problem details.

#### Scenario: Session expansion

- GIVEN a session row in the history table
- WHEN the parent taps or clicks the row
- THEN a nested detail section MUST expand below the row
- AND display a sub-table with columns: Question, Ana's answer, Correct answer, Time (s), Result (✅/❌)

#### Scenario: Incorrect answer highlighting

- GIVEN a problem in the drill-down was answered incorrectly
- WHEN the detail row renders
- THEN the row MUST have a light red background or a red ❌ indicator
- AND the correct answer MUST be visually emphasized

#### Scenario: Collapse on re-tap

- GIVEN a session row is expanded showing details
- WHEN the parent taps the same row again
- THEN the detail section MUST collapse
- AND the view MUST return to the summary table

### R6: Filtering and Search

The parent view SHOULD allow filtering history by date range and by skill.

#### Scenario: Filter by skill

- GIVEN the parent view shows sessions across multiple skills
- WHEN the parent selects "Multiplicación" from a filter dropdown
- THEN only sessions that included the multiplication skill MUST be shown
- AND sessions without multiplication MUST be hidden
- AND the pagination MUST recalculate based on filtered results

#### Scenario: Filter by date range

- GIVEN the parent wants to see sessions from the last week
- WHEN selecting date range "01/06/2026" to "07/06/2026"
- THEN only sessions within that date range MUST display
- AND the date range filter SHOULD use a native date input or date picker

#### Scenario: Clear filters

- GIVEN a skill filter is active
- WHEN the parent taps "Limpiar filtros"
- THEN all filters MUST reset
- AND all sessions MUST display (full unfiltered history)

## Acceptance Criteria

- [ ] Child view shows unlocked skills as color-coded circular progress rings
- [ ] Rings colored: red (<40%), yellow (40–69%), green (70–99%), full green + star (100%)
- [ ] Ring animates from 0 to current percentage on first load
- [ ] Sub-skill breakdown visible on ring tap
- [ ] 7-day activity calendar with streak counter
- [ ] "Vista de padres" button with parent gate
- [ ] Session history table: 10 per page, sorted by date desc
- [ ] Empty state shows "Aún no hay sesiones completadas"
- [ ] Drill-down shows per-problem details with incorrect answers highlighted red
- [ ] Filter by skill and date range with clear-filters option
