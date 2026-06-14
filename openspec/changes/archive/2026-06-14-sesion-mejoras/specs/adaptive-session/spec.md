# Adaptive Session Specification

## Purpose

Define the adaptive session flow including post-session correction phase where children can retry failed problems for extra stars.

## Requirements

### Requirement: C1 — Correction Phase Entry

The system MUST offer a correction phase after the session results when the child had one or more incorrect answers.

#### Scenario: Correction phase offered

- GIVEN Ana completes a session with at least one incorrect answer
- WHEN the ResultsScreen displays
- THEN a "Corregir y ganar estrellas" button MUST appear alongside the mini-game offer
- AND tapping it MUST navigate to CorrectionPhase
- AND if Ana had zero incorrect answers, the correction button MUST NOT appear

#### Scenario: Skip correction goes to mini-game offer

- GIVEN Ana completes a session with incorrect answers
- WHEN Ana taps "Volver al inicio" or skips correction
- THEN the system MUST proceed to the mini-game offer (existing flow)

### Requirement: C2 — Correction Phase Mechanics

The system MUST present each incorrect problem for a single retry attempt.

#### Scenario: Single retry per problem

- GIVEN CorrectionPhase is active with N incorrect problems
- WHEN the first problem is displayed
- THEN Ana gets exactly ONE attempt to answer
- AND if correct, +1⭐ is awarded immediately
- AND if incorrect, the correct answer is shown and no star is awarded
- AND the system automatically advances to the next problem

#### Scenario: Correction order

- GIVEN multiple incorrect problems
- WHEN CorrectionPhase starts
- THEN problems MUST be presented in the same order they appeared in the session

### Requirement: C3 — Correction Rewards

The system MUST award stars for corrected answers without affecting adaptive progress.

#### Scenario: Star award per correction

- GIVEN Ana retries an incorrect problem
- WHEN the retry is correct
- THEN exactly 1 star MUST be added to the session's running total
- AND the star counter SHOULD animate (+1 ⭐ fly to counter)

#### Scenario: No progress impact

- GIVEN Ana completes corrections
- WHEN the correction phase ends
- THEN skill mastery, streak, and adaptive engine state MUST remain unchanged from before correction

### Requirement: C4 — Correction Summary

The system MUST show a summary of extra stars earned.

#### Scenario: Correction completion screen

- GIVEN all correction problems have been attempted
- WHEN the last problem is resolved
- THEN a summary screen MUST display: "¡Ganaste {X} estrellas extra!"
- AND a brief celebration animation SHOULD play
- AND tapping "Continuar" MUST proceed to the mini-game offer

### Requirement: C5 — Positive Framing

The correction phase MUST use encouraging language and positive framing.

#### Scenario: Encouraging messages

- GIVEN CorrectionPhase is displayed
- WHEN any text is shown to Ana
- THEN messages MUST use positive framing ("¡Ahora podés ganar más estrellas!", "¡Seguí así!")
- AND MUST NOT use negative language ("fallaste", "error", "incorrecto")

## Acceptance Criteria

- [ ] Correction button appears only when there are incorrect answers
- [ ] Each failed problem gets exactly one retry attempt
- [ ] +1⭐ per corrected answer, 0 for wrong retry
- [ ] Adaptive engine / skill progress unchanged by corrections
- [ ] Summary screen shows total extra stars with celebration
- [ ] Positive language throughout correction phase