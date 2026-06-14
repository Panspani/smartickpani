# Delta for Gamification System

## ADDED Requirements

### Requirement: A1 — Per-Answer Mini-Confetti

The system MUST play a mini-confetti burst on each correct answer. The burst MUST be ≤20 particles and last ≤1 second.

#### Scenario: Mini-confetti on correct answer

- GIVEN Ana submits a correct answer
- WHEN the FeedbackOverlay displays
- THEN a confetti burst MUST play from the feedback area
- AND the burst MUST contain ≤20 particles
- AND the animation MUST complete within 1 second
- AND it MUST NOT block or delay the next problem load

#### Scenario: No confetti on incorrect

- GIVEN Ana submits an incorrect answer
- WHEN FeedbackOverlay displays
- THEN no confetti MUST play

### Requirement: A2 — Mute Button in Session Top Bar

The system MUST display a mute/unmute toggle button in the SessionScreen top bar. It SHALL use the existing `smartick.settings.audioEnabled` localStorage key.

#### Scenario: Mute button visible

- GIVEN a session is active
- WHEN the top bar renders
- THEN a speaker icon button MUST be visible
- AND tapping it MUST toggle `smartick.settings.audioEnabled` between `true` and `false`
- AND the icon MUST reflect current state (speaker on / speaker off)

#### Scenario: Mute state persists across sessions

- GIVEN Ana mutes audio via the top-bar button
- WHEN a new session starts
- THEN the mute state SHALL be read from `smartick.settings.audioEnabled`
- AND audio MUST remain muted if the value is `false`

## MODIFIED Requirements

### Requirement: R5 — Audio Feedback

The system MUST provide audio feedback for correct and incorrect answers. Audio MUST use short Base64-encoded audio samples or TTS, replacing Web Audio API synthesis.
(Previously: Web Audio API programmatic synthesis)

#### Scenario: Correct answer chime

- GIVEN Ana submits a correct answer
- WHEN the answer is evaluated
- THEN a rising two-tone chime MUST play (C5 → E5, ≤200ms total)
- AND it MUST use a Base64-encoded sample or TTS playback

#### Scenario: Incorrect answer tone

- GIVEN Ana submits an incorrect answer
- WHEN the answer is evaluated
- THEN a single low tone MUST play (G3, ≤300ms)
- AND it MUST use a Base64-encoded sample or TTS
- AND the tone MUST be gentle, not harsh

#### Scenario: Milestone fanfare

- GIVEN Ana reaches a streak milestone (5, 10, 15)
- WHEN the milestone popup appears
- THEN a three-tone ascending fanfare MUST play (C5 → E5 → G5, ≤400ms)
- AND it MUST replace the standard correct chime for that answer

#### Scenario: Mute toggle persists

- GIVEN Ana mutes audio via the top-bar button or settings
- WHEN any subsequent answer is submitted
- THEN no audio feedback MUST play
- AND the mute state MUST persist via `smartick.settings.audioEnabled`

#### Scenario: Audio context initialization

- GIVEN Ana interacts with the app for the first time
- WHEN the session starts
- THEN the system MUST initialize audio playback on user gesture (browser policy)
- AND samples SHALL be preloaded or lazily loaded (≤50 KB total)

## REMOVED Requirements

### Requirement: — Web Audio API synthesis requirement line

(Reason: Audio approach changed from programmatic synthesis to Base64 sample playback / TTS for better quality and consistency.)

## Acceptance Criteria

- [ ] Mini-confetti on correct answer: ≤20 particles, ≤1s
- [ ] Mute button visible in SessionScreen top bar
- [ ] Mute state persisted via `smartick.settings.audioEnabled`
- [ ] Audio uses Base64 samples or TTS (no Web Audio API synthesis)
- [ ] Correct/incorrect/milestone sounds play correctly via new audio layer
- [ ] No regression in existing star, streak, badge, or message logic
