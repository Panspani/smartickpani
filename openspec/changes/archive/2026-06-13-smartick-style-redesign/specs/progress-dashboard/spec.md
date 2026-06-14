# Delta for Progress Dashboard

## ADDED Requirements

### Requirement: A1 — Adventure Theme Decor

The dashboard MUST apply adventure/pirate-themed SVG decorations and iconography across the child view. Text SHALL use playful language consistent with the theme.

#### Scenario: Background decorations

- GIVEN the child dashboard renders
- WHEN the view loads
- THEN SVG decorative elements MUST appear (e.g., compass, treasure map, waves, ship wheel)
- AND decorations MUST be positioned as non-interactive background/edge elements
- AND they MUST NOT overlap or obscure skill rings or interactive content

#### Scenario: Themed icons

- GIVEN skill rings, streak calendar, and navigation elements render
- WHEN they display
- THEN icons SHOULD follow the adventure theme:
  - Star icons → treasure star (⭐ with gem tones)
  - Fire icon (streak) → flame torch or campfire
  - Lock icon (locked skills) → treasure chest with lock
  - Checkmark → treasure map X-marks-the-spot

#### Scenario: Themed text labels

- GIVEN UI text labels display on the child dashboard
- WHEN rendering labels
- THEN the system SHOULD use adventure-themed phrasing:
  - "Racha" → "Racha del tesoro"
  - "Estrellas" → "Monedas de oro"
  - "Sesión completada" → "Misión cumplida"
- AND original labels MUST remain as fallback if translations are not implemented

## MODIFIED Requirements

### Requirement: R1 — Child View — Skill Progress Rings

The child dashboard MUST display all unlocked skills in a visual grid. The primary color MUST change from #6C5CE7 (purple) to #FF6B35 (orange). Hardcoded purple references in ring colors, backgrounds, and accents MUST be replaced by CSS variables.
(Previously: Purple (#6C5CE7) primary color throughout)

#### Scenario: Unlocked skills displayed (color updated)

- GIVEN Ana has unlocked skills skill-05 through skill-08 (4 skills)
- WHEN viewing the child dashboard
- THEN exactly 4 skill rings MUST display in a grid layout
- AND each ring MUST use orange (#FF6B35) as the primary accent color instead of purple
- AND locked skills MUST NOT appear (or appear grayed with a treasure chest lock icon)

#### Scenario: Color-coded mastery bands (updated)

- GIVEN skill-05 is at 25%, skill-06 at 55%, skill-07 at 85%, skill-08 at 100%
- WHEN the dashboard renders
- THEN skill-05 ring MUST be red (0–39%) — unchanged
- AND skill-06 ring MUST be yellow (40–69%) — unchanged
- AND skill-07 ring MUST be green (70–99%) — unchanged
- AND skill-08 ring MUST be fully filled with orange (#FF6B35) ring stroke and a treasure star icon at 100%

#### Scenario: Ring animation on first view (unchanged)

- GIVEN the child dashboard loads for the first time
- WHEN skill rings render
- THEN each ring SHOULD animate from 0 to its current percentage over 1 second
- AND the percentage number SHOULD count up during the animation

#### Scenario: Sub-skill breakdown on tap (unchanged)

- GIVEN Ana taps a skill ring
- WHEN the ring is tapped
- THEN a sub-skill breakdown SHOULD expand below or as a tooltip
- AND each sub-skill SHALL show: name, mastered/unmastered badge, accuracy %, and last-practiced date

### Requirement: R2 — Session Streak Calendar (visual update)

The child dashboard SHOULD display the last 7 days with adventure-themed icons for day status.

#### Scenario: 7-day activity with themed icons

- GIVEN Ana completed sessions Monday-Friday
- WHEN viewing the child dashboard
- THEN completed days SHALL display a treasure chest icon (open) instead of checkmark
- AND missed days SHALL display a gray chest (closed) or empty circle
- AND the streak counter SHOULD show "Racha del tesoro: 5 días 🔥"

## Acceptance Criteria

- [ ] Primary color changed from #6C5CE7 to #FF6B35 via CSS variables everywhere
- [ ] No hardcoded purple remains (all via CSS variable `--color-primary`)
- [ ] Adventure theme SVG decorations render without obstructing content
- [ ] Themed icons for stars, streaks, locks, and checkmarks
- [ ] Adventure-themed text labels applied where feasible
- [ ] All existing dashboard interactions (taps, expand, filter) remain functional
- [ ] Parent view unchanged — theme update applies to child view only
