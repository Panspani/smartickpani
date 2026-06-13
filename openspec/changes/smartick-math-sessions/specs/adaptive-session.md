# Adaptive Session Specification

## Purpose

Define the timed 15-minute session structure (warm-up → core → cool-down) with real-time adaptive problem selection based on accuracy, response time, streak, and sub-skill mastery — delivering a Smartick-like daily experience for Ana (8yo).

## Requirements

### R1: Session Structure

Each session MUST follow a fixed 3-phase sequence with defined time allocations. The total duration MUST be 15 minutes.

- Warm-up phase: 2 minutes (mixed review from mastered content)
- Core phase: 10 minutes (adaptive problem selection focused on current skills)
- Cool-down phase: 3 minutes (easy, celebratory problems from mastered content)

#### Scenario: Full session lifecycle

- GIVEN Ana starts a new session
- WHEN the session begins
- THEN the warm-up phase starts with a 2:00 countdown
- AND problems are drawn from mastered skills at difficulty tier 1
- WHEN the warm-up timer expires OR all warm-up problems are answered
- THEN the core phase begins with a 10:00 countdown
- AND adaptive problem selection activates
- WHEN the core timer expires
- THEN the cool-down phase begins with a 3:00 countdown
- AND problems are drawn from mastered content at tier 1
- WHEN the cool-down timer expires
- THEN the session ends and transitions to the results screen

#### Scenario: Early phase advancement

- GIVEN Ana answers all warm-up problems before 2 minutes
- WHEN the last warm-up answer is submitted
- THEN the system MAY advance to core phase immediately
- BUT the cool-down phase MUST NOT be skipped — it always runs for at least 30 seconds or until its problems are exhausted

#### Scenario: Minimum cool-down time

- GIVEN Ana enters cool-down phase
- WHEN she answers all cool-down problems in under 30 seconds
- THEN the system SHALL extend cool-down with additional easy problems
- UNTIL at least 30 seconds of cool-down time has elapsed
- OR the total session timer reaches 15:00

### R2: Session Timer

The system MUST implement a monotonic countdown timer from 15:00 to 0:00 displayed in MM:SS format.

#### Scenario: Timer display format

- GIVEN a session has been running for 3 minutes and 42 seconds
- WHEN the timer renders
- THEN it MUST display "11:18" (remaining time)
- AND update at least once per second

#### Scenario: Hard stop at zero

- GIVEN the timer reaches 0:00
- WHEN a problem is currently displayed
- THEN the current answer MUST be recorded if the user had submitted it
- OR marked as unanswered (isCorrect: false, responseTimeMs: null) if no submission
- AND the session MUST terminate immediately and show results

#### Scenario: Session resumption after page refresh

- GIVEN Ana was mid-session with 420 elapsed seconds
- WHEN the page reloads
- THEN the session state MUST be restored from localStorage
- AND the timer resumes from 420 seconds elapsed (not from 0)
- AND the current phase, problem index, streak, and stars earned are all restored

### R3: Warm-Up Phase Rules

Warm-up problems MUST be drawn from skills with >50% mastery. Difficulty MUST be set to tier 1 regardless of current working level.

#### Scenario: Warm-up draws from mastered skills

- GIVEN Ana has 70% mastery in skill-05 and is actively working on skill-06
- WHEN the warm-up phase runs
- THEN problems MUST NOT come from skill-06
- AND MUST come from skill-05 (or other skills >50%)
- AND difficulty MUST be tier 1

#### Scenario: No mastered skills available

- GIVEN Ana is new and no skill has >50% mastery yet
- WHEN the warm-up phase runs
- THEN the system SHOULD use the skill with the highest current mastery percentage
- OR skill-05 by default

### R4: Adaptive Problem Selection (Core Phase)

The system MUST select the next core problem using a weighted decision function that considers:

1. Current skill in focus (the skill with lowest non-mastered sub-skill count)
2. Recent accuracy (last 5 answers per skill)
3. Response time trend (accelerating = easier, decelerating = harder)
4. Current streak length (long streak → increase difficulty)
5. Sub-skill mastery level (favor non-mastered sub-skills)

#### Scenario: Decrease difficulty after consecutive errors

- GIVEN Ana answers 2 consecutive problems incorrectly within the same sub-skill
- WHEN selecting the next problem
- THEN the adaptive engine MUST select a problem one difficulty tier lower within that sub-skill
- AND if already at tier 1, switch to a different sub-skill within the same skill

#### Scenario: Increase difficulty after consistent success

- GIVEN Ana answers 4 consecutive problems correctly with response time ≤15 seconds each
- WHEN selecting the next problem
- THEN the adaptive engine SHOULD increase difficulty by one tier
- BUT MUST NOT exceed tier 3

#### Scenario: Skill rotation for variety

- GIVEN Ana has answered 4 problems in a row from the same skill
- WHEN selecting the next problem
- THEN the adaptive engine SHOULD rotate to a different available skill
- UNLESS only one skill is available

#### Scenario: Weight toward non-mastered sub-skills

- GIVEN a skill has 3 sub-skills, 1 mastered and 2 unmastered
- WHEN selecting sub-skill within that skill
- THEN unmastered sub-skills MUST have 3× selection weight compared to mastered ones

#### Scenario: Streak affects difficulty

- GIVEN Ana has a streak of 6 or more correct answers
- WHEN selecting the next problem
- THEN the engine MAY increase difficulty by one tier regardless of other factors
- AND MAY switch to a harder sub-skill within the same skill

### R5: Cool-Down Phase Rules

Cool-down problems MUST come from mastered content only at difficulty tier 1. Every correct answer SHOULD trigger positive reinforcement.

#### Scenario: Cool-down problem selection

- GIVEN Ana enters cool-down
- WHEN the system selects a cool-down problem
- THEN it MUST draw from any mastered sub-skill at tier 1
- AND SHOULD prefer sub-skills Ana enjoys (based on fastest response times)

#### Scenario: Cool-down error handling

- GIVEN Ana answers a cool-down problem incorrectly
- WHEN feedback is displayed
- THEN the correct answer MUST be shown gently
- AND no negative feedback or penalty SHOULD be applied
- AND the next problem MUST remain easy

### R6: Session Completion

When the session ends (timer expires), the system MUST compute and display:

- Total stars earned (accumulated + bonus)
- Maximum streak achieved
- Overall accuracy percentage
- Skills practiced (list)
- Problems answered count
- Badges earned (if any)

#### Scenario: Results display

- GIVEN Ana completes a session with 24 stars, max streak 7, 80% accuracy, 3 skills practiced, 15 problems
- WHEN results render
- THEN the screen MUST show all metrics
- AND any newly earned badges MUST animate/glow
- AND the data MUST be persisted to localStorage before display

## Acceptance Criteria

- [ ] Session follows warm-up (2min) → core (10min) → cool-down (3min) sequence
- [ ] Timer counts down from 15:00 in MM:SS format, updates at least once per second
- [ ] Hard stop at 0:00 — current answer recorded or marked unanswered
- [ ] Session state survives page refresh (restored from localStorage)
- [ ] Adaptive engine decreases tier after 2 consecutive errors in same sub-skill
- [ ] Adaptive engine increases tier after 4 consecutive correct with fast response
- [ ] Skill rotation every 4 problems
- [ ] Non-mastered sub-skills weighted 3× vs mastered
- [ ] Cool-down uses mastered content at tier 1 only
- [ ] Results screen shows all computed metrics and persists to localStorage
