# Monster Mascot Specification

## Purpose

Define an animated monster mascot companion that reacts to session events, providing visual encouragement and emotional engagement for the child user.

## Requirements

### R1: MonsterDisplay Component

The system MUST render a `MonsterDisplay` component with 5 SVG states, rendered inline with no external assets.

#### Scenario: Five states defined

- GIVEN the MonsterDisplay component exists
- WHEN it is mounted or a state change is triggered
- THEN the system MUST support these states: `idle`, `happy`, `sad`, `thinking`, `celebration`
- AND each state MUST be a distinct inline SVG (zero network requests)
- AND SVGs MUST NOT exceed 5 KB each

#### Scenario: Idle state on mount

- GIVEN a session is active and no answer has been submitted
- WHEN MonsterDisplay renders in SessionScreen
- THEN it MUST show the `idle` state with gentle continuous animation (breathing or bobbing)
- AND it MUST NOT distract from the problem content

#### Scenario: Happy on correct

- GIVEN Ana answers correctly
- WHEN FeedbackOverlay displays
- THEN MonsterDisplay MUST transition to `happy` state (smiling, bouncing)
- AND MUST return to `idle` within 2 seconds

#### Scenario: Sad on incorrect

- GIVEN Ana answers incorrectly
- WHEN FeedbackOverlay displays
- THEN MonsterDisplay MUST transition to `sad` state (droopy ears/eyes, gentle)
- AND MUST NOT show negative reinforcement — the expression MUST be encouraging, not mocking
- AND MUST return to `idle` within 2 seconds

#### Scenario: Thinking during problem

- GIVEN Ana is viewing a new problem (no answer yet)
- WHEN the problem renders
- THEN MonsterDisplay OPTIONALLY MAY show the `thinking` state (head scratch, finger on chin)
- AND return to `idle` within 3 seconds

#### Scenario: Celebration on streak milestone

- GIVEN Ana reaches a streak of ≥5
- WHEN the streak popup appears
- THEN MonsterDisplay MUST transition to `celebration` state (jumping, confetti sparkles SVG)
- AND return to `idle` within 3 seconds

### R2: MonsterDisplay Placement

The system MUST render MonsterDisplay in three locations: SessionScreen, FeedbackOverlay, ResultsScreen.

#### Scenario: SessionScreen during problems

- GIVEN a session is active
- WHEN the problem area renders
- THEN MonsterDisplay SHALL be visible in a fixed container (bottom-right corner or beside problem)
- AND the container MUST have fixed dimensions to prevent layout shift

#### Scenario: FeedbackOverlay presence

- GIVEN FeedbackOverlay appears after an answer
- WHEN it renders
- THEN MonsterDisplay MUST appear within the overlay alongside the encouraging message
- AND it MUST respect the same 5-state logic

#### Scenario: ResultsScreen celebration

- GIVEN the session ends and ResultsScreen renders
- WHEN the summary displays
- THEN MonsterDisplay MUST render in `celebration` state for 3 seconds, then `idle`
- AND it MUST be positioned beside the session summary

## Acceptance Criteria

- [ ] 5 distinct inline SVG states: idle, happy, sad, thinking, celebration
- [ ] State transitions triggered by: mount, correct, incorrect, streak milestone, session end
- [ ] Positive-only expressions — no negative or scary designs
- [ ] Fixed container dimensions prevent layout shift
- [ ] Renders in SessionScreen, FeedbackOverlay, and ResultsScreen
- [ ] Each SVG ≤5 KB, zero network requests
