# Persistence Layer Specification

## Purpose

Define the localStorage schema for all user data, session history, skill state, settings, and badges — enabling data persistence across page reloads with the `smartick.` namespace prefix for full isolation from other apps.

## Requirements

### R1: Namespace Isolation

All localStorage keys MUST be prefixed with `smartick.`. The persistence layer MUST NOT read or write any keys outside this namespace.

#### Scenario: Namespaced key format

- GIVEN the persistence layer writes skill state
- WHEN inspecting localStorage
- THEN the key MUST be `smartick.skills`
- AND no other `smartick.*` key SHALL collide with keys from other apps on the same domain

#### Scenario: External keys ignored

- GIVEN localStorage contains `sumas-lola.highscores` from another app
- WHEN the persistence layer initializes
- THEN the external key MUST be ignored
- AND reading or writing `smartick.*` keys MUST NOT be affected

#### Scenario: Read failure isolation

- GIVEN a `smartick.*` key has corrupted JSON
- WHEN the persistence layer tries to read it
- THEN the system MUST catch the parse error
- AND return the default value for that key
- AND SHOULD log a warning but not crash

### R2: Data Schema — Skill State (`smartick.skills`)

The value MUST be a JSON object with one entry per skill keyed by skill ID.

#### Schema definition

```json
{
  "skill-05": {
    "id": "skill-05",
    "name": "Práctica de la multiplicación",
    "skillMastered": false,
    "masteryPercentage": 65,
    "lastPracticed": "2026-06-12T14:30:00.000Z",
    "subSkills": [
      {
        "id": "skill-05-01",
        "name": "Tablas del 1 al 10",
        "mastered": true,
        "accuracy": 85,
        "attempts": 20,
        "correctCount": 17,
        "totalResponseTimeMs": 360000,
        "lastAttempts": [true, true, false, true, true, true, true, false, true, true]
      }
    ]
  }
}
```

#### Scenario: Skill state persistence

- GIVEN Ana achieves 65% mastery in skill-05
- WHEN `smartick.skills` is read from localStorage
- THEN the skill-05 entry MUST contain `"masteryPercentage": 65` and `"skillMastered": false`
- AND each sub-skill MUST include accuracy, attempts, correctCount, totalResponseTimeMs, and lastAttempts (array of last 10 boolean results)

#### Scenario: Atomic update after session

- GIVEN Ana completes a session that improves skill-06 mastery from 40% to 55%
- WHEN the session ends
- THEN `smartick.skills` MUST be updated in a single write operation
- AND the update MUST survive a page reload

#### Scenario: lastAttempts rolling window

- GIVEN a sub-skill has 10 attempts recorded in `lastAttempts`
- WHEN an 11th attempt occurs
- THEN the oldest entry MUST be removed (FIFO)
- AND the array MUST contain exactly 10 entries after the update

### R3: Data Schema — Session History (`smartick.sessions`)

The value MUST be a JSON array of session objects, capped at 30 entries.

#### Schema definition (per session object)

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "date": "2026-06-12T14:30:00.000Z",
  "durationSeconds": 900,
  "phasesCompleted": {
    "warmup": true,
    "core": true,
    "cooldown": true
  },
  "accuracy": 80,
  "totalStars": 24,
  "streakMax": 7,
  "skillsPracticed": ["skill-05", "skill-06"],
  "problems": [
    {
      "skillId": "skill-05",
      "subSkillId": "skill-05-01",
      "question": "7 × 8 = ?",
      "answer": 56,
      "correctAnswer": 56,
      "isCorrect": true,
      "responseTimeMs": 8500,
      "tier": 2,
      "phase": "core",
      "type": "multiple-choice"
    }
  ]
}
```

#### Scenario: Session record written

- GIVEN Ana completes a full 15-minute session
- WHEN the session ends
- THEN a new session object MUST be appended to `smartick.sessions`
- AND each problem entry MUST include: skillId, subSkillId, question, answer, correctAnswer, isCorrect, responseTimeMs, tier, phase, type

#### Scenario: History capped at 30

- GIVEN `smartick.sessions` already contains 30 sessions
- WHEN a 31st session is completed
- THEN the oldest session (earliest date) MUST be removed before appending
- AND the array MUST contain exactly 30 sessions after the operation

#### Scenario: Empty history on first use

- GIVEN Ana has not completed any sessions
- WHEN `smartick.sessions` is read
- THEN the value MUST be an empty array `[]`

### R4: Data Schema — Settings (`smartick.settings`)

The value MUST be a JSON object with user-configurable settings.

#### Schema definition

```json
{
  "audioEnabled": true,
  "language": "es-AR",
  "lastSessionDate": "2026-06-12",
  "streakDays": 3,
  "lastActivityDate": "2026-06-12"
}
```

#### Scenario: Settings persistence

- GIVEN Ana's parent disables audio via the mute toggle
- WHEN `smartick.settings` is read
- THEN `audioEnabled` MUST be `false`
- WHEN a new session starts
- THEN audio MUST NOT play (muted state honored)

#### Scenario: Streak day tracking

- GIVEN Ana completes a session on 2026-06-12
- WHEN the session ends
- THEN `lastSessionDate` MUST be set to "2026-06-12"
- AND `lastActivityDate` MUST be set to "2026-06-12"
- GIVEN `lastActivityDate` was "2026-06-11" (yesterday)
- THEN `streakDays` MUST increment by 1
- GIVEN `lastActivityDate` was "2026-06-10" (day before yesterday)
- THEN `streakDays` MUST reset to 1

### R5: Data Schema — Badges (`smartick.badges`)

The value MUST be a JSON array of badge objects.

#### Schema definition (per badge)

```json
{
  "id": "first-session",
  "name": "Primera sesión",
  "description": "Completaste tu primera sesión",
  "earnedAt": "2026-06-12T14:30:00.000Z"
}
```

#### Scenario: Badge persistence

- GIVEN Ana earns the "Primera sesión" badge
- WHEN `smartick.badges` is read
- THEN the array MUST contain one entry with `id: "first-session"` and a valid ISO 8601 `earnedAt` timestamp

#### Scenario: No duplicate badges

- GIVEN `smartick.badges` already contains "first-session"
- WHEN the badge eligibility check runs again
- THEN the system MUST NOT append a duplicate entry
- AND the array MUST still contain only one entry for "first-session"

### R6: Session State (In-Progress) — `smartick.sessionState`

The system MUST persist in-progress session state to support recovery after page refresh.

#### Schema definition

```json
{
  "active": true,
  "phase": "core",
  "elapsedSeconds": 420,
  "currentProblemIndex": 8,
  "problemsAnswered": 8,
  "currentStreak": 5,
  "starsEarned": 14,
  "startTime": "2026-06-12T14:00:00.000Z",
  "problemQueue": [
    { "skillId": "skill-05", "subSkillId": "skill-05-01", ... }
  ]
}
```

#### Scenario: Session recovery after refresh

- GIVEN Ana is in core phase at 420 elapsed seconds, streak of 5, 8 problems answered
- WHEN the page refreshes
- AND the session initializer reads `smartick.sessionState`
- THEN the session MUST resume at core phase with all state restored
- AND the timer MUST count down from (900 − 420) = 480 seconds

#### Scenario: Session state cleanup on normal completion

- GIVEN a session completes normally (timer reaches 0)
- WHEN the results screen is displayed
- THEN `smartick.sessionState` MUST be removed from localStorage entirely
- AND NOT set to `{ active: false }` — the key must be deleted

#### Scenario: Stale session cleanup

- GIVEN a session was abandoned mid-way (user closed tab)
- WHEN the app loads again after 60+ minutes
- THEN the system MUST detect the stale session
- AND discard `smartick.sessionState`
- AND prompt Ana to start a fresh session

#### Scenario: Stale session threshold

- GIVEN `smartick.sessionState` exists with `startTime` = T
- WHEN the app initializes and current time > T + 60 minutes
- THEN the session is considered stale
- AND MUST be discarded
- WHEN current time ≤ T + 60 minutes
- THEN the session is considered valid for recovery

### R7: Persistence Service API

The persistence layer MUST expose a thin service interface with the following operations:

- `getSkillState(): SkillMap` — reads and parses `smartick.skills`
- `updateSkillState(skillId, subSkillResults): void` — updates sub-skill data atomically
- `getSessions(): Session[]` — returns session history
- `saveSession(session): void` — appends session, enforces cap
- `getSettings(): Settings` — reads settings with defaults
- `updateSettings(partial): void` — merges partial settings
- `getBadges(): Badge[]` — returns earned badges
- `awardBadge(badge): void` — adds badge if not already present
- `saveSessionState(state): void` — writes in-progress state
- `clearSessionState(): void` — removes in-progress state
- `getSessionState(): SessionState | null` — reads in-progress state (may return null if stale)

#### Scenario: getSettings returns defaults on missing key

- GIVEN localStorage has no `smartick.settings` key (first run)
- WHEN `getSettings()` is called
- THEN it MUST return: `{ audioEnabled: true, language: "es-AR", lastSessionDate: null, streakDays: 0, lastActivityDate: null }`
- AND MUST NOT throw or return undefined

## Acceptance Criteria

- [ ] All keys prefixed with `smartick.` — no writes outside namespace
- [ ] Corrupted JSON returns defaults, does not crash
- [ ] Skill state: per-sub-skill accuracy, attempts, rolling lastAttempts (10)
- [ ] Session history: capped at 30, oldest removed when full
- [ ] Settings: audioEnabled, language, lastSessionDate, streakDays, lastActivityDate
- [ ] Badges: array, no duplicates for same id
- [ ] Session state: persisted mid-session for recovery
- [ ] Session state removed after normal completion (key deleted)
- [ ] Stale session discarded after 60 minutes
- [ ] API surface: all 10 operations defined in R7
- [ ] Default settings returned when key absent
