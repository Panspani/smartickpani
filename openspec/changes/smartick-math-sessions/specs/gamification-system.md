# Gamification System Specification

## Purpose

Define motivational mechanics that reward effort and progress: stars per correct answer, streaks for consecutive correct answers, badges for milestones, confetti animation, audio feedback via Web Audio API, and context-aware encouraging messages — all designed for an 8-year-old user.

## Requirements

### R1: Stars Per Correct Answer

The system MUST award stars for each correct answer. Stars scale with difficulty tier and accumulate into a session total and a running total.

#### Scenario: Star award scales with tier

- GIVEN Ana answers a tier-1 problem correctly
- WHEN the answer is submitted
- THEN 1 star MUST be added to the session total
- GIVEN Ana answers a tier-2 problem correctly
- THEN 2 stars MUST be awarded
- GIVEN Ana answers a tier-3 problem correctly
- THEN 3 stars MUST be awarded

#### Scenario: No stars for incorrect answers

- GIVEN Ana answers incorrectly
- WHEN the answer is submitted
- THEN zero stars MUST be awarded for that problem

#### Scenario: Star animation on award

- GIVEN Ana answers correctly and earns stars
- WHEN the star count updates
- THEN a brief star-burst or "+N ⭐" animation SHOULD play for ≤1 second
- AND SHOULD NOT block answering the next problem

### R2: Streaks

The system MUST track consecutive correct answers within a session. The streak resets to 0 on any incorrect answer.

#### Scenario: Streak counter display

- GIVEN Ana has answered 3 consecutive problems correctly
- WHEN the 4th correct answer is submitted
- THEN the streak counter MUST display 4
- AND a fire emoji (🔥) or fire icon SHOULD be visible next to the counter
- AND the streak SHOULD appear in the header area of the session screen

#### Scenario: Streak reset on error

- GIVEN Ana has a streak of 7
- WHEN an incorrect answer is submitted
- THEN the streak MUST reset to 0
- AND the fire icon MUST disappear or gray out

#### Scenario: Streak milestone bonus stars

- GIVEN Ana reaches a streak of 5 consecutive correct answers
- WHEN the 5th correct answer is submitted
- THEN 1 bonus star MUST be awarded
- AND a "¡Racha de 5!" popup SHOULD appear for 1.5 seconds
- GIVEN streak reaches 10
- THEN 3 bonus stars awarded with "¡Racha de 10!" popup
- GIVEN streak reaches 15
- THEN 5 bonus stars awarded with "¡Racha de 15!" popup

#### Scenario: Bonus stars count toward session total

- GIVEN Ana earns 2 bonus stars from a streak milestone
- WHEN the session results are computed
- THEN the total stars MUST include the bonus stars
- AND the stars display at the end MUST match the accumulated total

### R3: Badges

The system MAY award badges for cumulative achievements that persist across sessions. Badges MUST be awarded only once per achievement.

#### Scenario: Badge definitions

- WHEN the system checks for badge eligibility
- THEN the following badges MUST be defined:
  - `first-session` "Primera sesión" — complete first session
  - `streak-5-days` "Racha de 5" — complete sessions on 5 consecutive days
  - `master-mathematician` "Matemático" — master all 8 skills
  - `speed-demon` "Rápido" — average response time <15s across 5 sessions

#### Scenario: First session badge

- GIVEN Ana completes her first session
- WHEN the session results screen renders
- THEN the "Primera sesión" badge MUST be awarded
- AND a badge-earned animation MUST play (glow + confetti)
- AND the badge MUST appear in the results screen

#### Scenario: Badge earned only once

- GIVEN Ana has already earned "Primera sesión" in a previous session
- WHEN any subsequent session completes
- THEN the badge MUST NOT be awarded again
- AND no badge-earned animation MUST play for that badge

#### Scenario: Badge eligibility check at session end

- GIVEN Ana completes a session
- WHEN the session ends
- THEN the system MUST check all badge conditions
- AND award any newly eligible badges
- AND persist them to localStorage under `smartick.badges`

### R4: Confetti Animation

The system SHOULD display confetti animation for celebratory events using CSS keyframes or canvas (no external libraries).

#### Scenario: Session completion confetti

- GIVEN Ana completes a full 15-minute session
- WHEN the results screen renders
- THEN a confetti animation MUST play for 2–3 seconds
- AND it MUST NOT block interaction with the results
- AND it SHOULD gracefully fade out

#### Scenario: Badge earned confetti

- GIVEN a badge is earned at session end
- WHEN the badge animation plays
- THEN confetti SHOULD accompany the badge reveal
- AND SHOULD be distinguishable from session-completion confetti (different color palette)

#### Scenario: Performance constraint

- GIVEN a confetti animation is playing
- WHEN the user interacts with any UI element
- THEN the animation MUST NOT cause input lag or frame drops
- AND the system SHOULD limit particle count to ≤50 particles on screen

### R5: Audio Feedback (Web Audio API)

The system MUST provide audio feedback for correct and incorrect answers using the Web Audio API. Audio MUST be synthesized programmatically (no external files).

#### Scenario: Correct answer chime

- GIVEN Ana submits a correct answer
- WHEN the answer is evaluated
- THEN a rising two-tone chime MUST play: C5 → E5, 200ms total duration
- AND the second tone SHOULD start 100ms after the first

#### Scenario: Incorrect answer tone

- GIVEN Ana submits an incorrect answer
- WHEN the answer is evaluated
- THEN a single low tone MUST play: G3, 300ms duration
- AND the tone SHOULD be gentle, not harsh

#### Scenario: Milestone fanfare

- GIVEN Ana reaches a streak milestone (5, 10, 15)
- WHEN the milestone popup appears
- THEN a three-tone ascending fanfare SHOULD play: C5 → E5 → G5, 400ms total
- AND this SHOULD play instead of the standard correct chime

#### Scenario: Mute toggle

- GIVEN Ana or a parent taps the mute button
- WHEN any subsequent answer is submitted
- THEN no audio feedback MUST play
- AND the mute state MUST persist across sessions via `smartick.settings.audioEnabled`

#### Scenario: Audio context initialization

- GIVEN Ana interacts with the app for the first time (clicks "Comenzar")
- WHEN the session starts
- THEN the system MUST create the AudioContext on user gesture (browser policy)
- AND SHOULD resume the AudioContext if it is suspended

### R6: Encouraging Messages

The system MUST display context-aware Spanish text messages after each answer. Messages rotate from a pool of ≥10 per context with anti-repetition logic.

#### Scenario: Correct answer messages

- GIVEN Ana answers correctly
- WHEN feedback displays
- THEN a message MUST appear from the correct-answer pool
- AND the pool MUST contain at least: "¡Muy bien!", "¡Excelente!", "¡Súper!", "¡Genial Ana!", "¡Así se hace!", "¡Perfecto!", "¡Eres una campeona!", "¡Maravilloso!", "¡Fantástico!", "¡Buenísimo!"
- AND the same message MUST NOT repeat within 3 consecutive correct answers

#### Scenario: Incorrect answer messages

- GIVEN Ana answers incorrectly
- WHEN feedback displays
- THEN a message MUST appear from the encouraging pool
- AND MUST NOT contain negative or critical language
- AND the pool MUST contain at least: "¡Casi!", "Inténtalo con calma", "Tú puedes", "¡Otra vez!", "No te rindas", "Respira hondo", "La próxima sale", "Tú puedes hacerlo", "Vamos, que tú puedes", "Un poquito más"
- AND MUST NOT say "incorrecto", "mal", "error", or similar negative words

#### Scenario: Post-streak-break encouragement

- GIVEN Ana had a streak ≥3 that just broke with an incorrect answer
- WHEN feedback displays
- THEN a special post-streak-break message SHOULD appear instead of a generic one
- AND MUST acknowledge the achievement: "¡Qué racha increíble! Sigue así"
- OR "¡Buena racha! La próxima será más larga"

#### Scenario: Message display duration

- GIVEN an encouraging message is displayed after an answer
- WHEN the next problem renders
- THEN the message MUST be visible for at least 1.5 seconds
- AND MUST fade out before or as the next problem appears

## Acceptance Criteria

- [ ] Stars awarded: 1 (tier-1), 2 (tier-2), 3 (tier-3) per correct answer
- [ ] Streak counter visible with fire icon, resets on incorrect answer
- [ ] Bonus stars at streak 5 (+1), 10 (+3), 15 (+5) with popup
- [ ] Badges awarded once per achievement and persisted
- [ ] Confetti on session completion and badge earned (≤50 particles, CSS/canvas only)
- [ ] Correct chime (C5→E5), incorrect tone (G3), milestone fanfare (C5→E5→G5)
- [ ] Mute toggle persists via localStorage
- [ ] ≥10 messages per context, no repeats within 3 consecutive
- [ ] No negative language in incorrect-answer messages
- [ ] Post-streak-break message when streak ≥3 broken
