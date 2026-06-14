# Delta for Gamification System

## ADDED Requirements

### Requirement: A3 — TTS Vocal Feedback

The system MUST provide spoken feedback using the browser SpeechSynthesis API for correct answers, incorrect answers, and milestones.

#### Scenario: Correct answer vocal feedback

- GIVEN Ana submits a correct answer
- WHEN the FeedbackOverlay displays
- THEN a random encouraging phrase MUST be spoken via SpeechSynthesis
- AND phrases SHALL be from: "¡Muy bien!", "¡Excelente!", "¡Perfecto!", "¡Genial!", "¡Sos un crack!"
- AND speech rate SHALL be 0.9 (slightly slower for children)
- AND language SHALL be es-AR (Argentine Spanish)

#### Scenario: Incorrect answer vocal feedback

- GIVEN Ana submits an incorrect answer
- WHEN the FeedbackOverlay displays for the first incorrect in the session
- THEN a supportive phrase MUST be spoken: "Casi..." or "¡Seguí intentando!"
- AND this MUST NOT repeat for subsequent incorrect answers in the same session

#### Scenario: Milestone vocal feedback

- GIVEN Ana reaches a streak milestone (5, 10, 15)
- WHEN the milestone popup appears
- THEN the phrase "¡Racha de {N}!" MUST be spoken via SpeechSynthesis
- AND this MUST replace the standard correct phrase for that answer

#### Scenario: Mute integration

- GIVEN smartick.settings.audioEnabled is false
- WHEN any TTS feedback would play
- THEN SpeechSynthesis MUST NOT speak
- AND no error MUST occur

#### Scenario: Graceful degradation

- GIVEN window.speechSynthesis is unavailable (e.g., Safari iOS restrictions)
- WHEN TTS feedback is triggered
- THEN the system MUST silently skip TTS without error
- AND visual feedback MUST remain unchanged

#### Scenario: Feature gate

- GIVEN smartick.settings.ttsEnabled is false
- WHEN TTS feedback would play
- THEN TTS MUST be skipped
- AND default audio chimes MUST still play

### Requirement: A4 — Background Music

The system MUST play a soft procedural background music loop during the session using Web Audio API.

#### Scenario: Music starts on session

- GIVEN a session begins
- WHEN the first problem loads
- THEN a background music loop MUST start playing via Web Audio API
- AND the loop SHALL be a simple pentatonic melody (8-16 bars)
- AND volume SHALL be ~0.05 (very low, background texture only)

#### Scenario: Music stops on session end

- GIVEN background music is playing
- WHEN the session ends (results screen shown)
- THEN the music MUST stop smoothly (fade out ≤500ms)
- AND AudioContext MUST be suspended or closed

#### Scenario: Master mute integration

- GIVEN smartick.settings.audioEnabled is false
- WHEN session starts or music is playing
- THEN background music MUST NOT play or MUST stop immediately
- AND the mute button MUST reflect the global audio state

#### Scenario: Separate music toggle

- GIVEN smartick.settings.musicEnabled is false
- WHEN session starts
- THEN background music MUST NOT play
- AND TTS and audio chimes MUST still work (controlled by master mute)

#### Scenario: Music characteristics

- GIVEN background music is playing
- WHEN analyzing the audio
- THEN the loop SHALL use OscillatorNode with sine/triangle waves
- AND notes SHALL be from a pentatonic scale (e.g., C-D-E-G-A)
- AND total loop duration SHALL be 8-16 bars at ~80 BPM
- AND volume SHALL be ≤0.05 (5% of max)

## MODIFIED Requirements

### Requirement: A2 — Mute Button in Session Top Bar

The mute button MUST control all audio channels: chimes, TTS, and background music.
(Previously: only controlled Base64 audio samples)

#### Scenario: Mute button controls all audio

- GIVEN session is active with music playing
- WHEN Ana taps the mute button
- THEN ALL audio MUST stop: chimes, TTS, background music
- AND smartick.settings.audioEnabled MUST be set to false
- AND the icon MUST update to speaker-off

#### Scenario: Unmute restores all audio

- GIVEN audio is muted via top-bar button
- WHEN Ana taps the mute button again
- THEN smartick.settings.audioEnabled MUST be set to true
- AND background music MUST resume (if musicEnabled is true)
- AND TTS and chimes MUST work on next trigger

### Requirement: R5 — Audio Feedback

Audio feedback MUST continue using Base64 samples/TTS for chimes, alongside new TTS vocal layer.
(Previously: Base64 samples or TTS for chimes only)

#### Scenario: Chimes and TTS coexist

- GIVEN Ana submits a correct answer
- WHEN feedback is triggered
- THEN BOTH the rising two-tone chime AND a TTS phrase MUST play
- AND TTS MUST NOT interrupt or delay the chime
- AND both MUST respect mute state

## REMOVED Requirements

None.

## Acceptance Criteria

- [ ] TTS speaks on correct/incorrect/milestone with es-AR voice, rate 0.9
- [ ] TTS respects master mute and ttsEnabled gate
- [ ] TTS degrades gracefully if SpeechSynthesis unavailable
- [ ] Background music plays during session, stops on end
- [ ] Music volume ~0.05, pentatonic loop via Web Audio API
- [ ] Music respects master mute and musicEnabled gate
- [ ] Mute button controls chimes + TTS + music together
- [ ] Chimes and TTS play together without conflict