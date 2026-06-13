# Design: Smartick Math Sessions

## Technical Approach

Pure-logic adaptive engine (`src/smartick/engine/`) with zero React dependencies, consumed by React hooks that feed a state-based navigation tree. localStorage persistence via a thin service layer. Web Audio API for synthesized feedback. All UI in Spanish, CSS namespaced with `.smartick-`, extending the existing `:root` CSS variable theme.

## Architecture Decisions

### Decision: State-based navigation over React Router

| Option | Tradeoff | Decision |
|--------|----------|----------|
| React Router | URL-bound, needs route config, overkill for 4 views | Rejected |
| State machine (`useReducer` + view enum) | Zero deps, direct transitions, testable | **Chosen** |
| Custom router | Premature abstraction | Rejected |

**Rationale**: 4 views (dashboard / session / results / parent) with strictly sequential transitions. A `view` state + `useReducer` is simpler than routing and keeps the session lifecycle explicit.

### Decision: Pure engine isolation

**Choice**: All adaptive logic in `src/smartick/engine/` — no React, no DOM, no side effects.
**Rationale**: Engine functions are pure `(state, event) → state` transformations. This makes them unit-testable without jsdom, portable, and independently verifiable. The spec requires tier changes after 2 consecutive errors, skill rotation every 4 problems, and weighted sub-skill selection — all testable as function outputs.

### Decision: localStorage as sole persistence

| Option | Tradeoff | Decision |
|--------|----------|----------|
| IndexedDB | Async overhead, more complex | Rejected |
| localStorage | Sync, blocking writes, 5MB limit | **Chosen** |
| Backend API | Out of scope per proposal | Rejected |

**Rationale**: The proposal caps history at 30 sessions (~5KB each → 150KB max). With 5 keys total, we stay well under the 5MB limit. `smartick.*` namespace isolates from other apps.

### Decision: No external animation libraries

**Choice**: CSS keyframes for confetti (≤50 particles), star animations, and badge reveals.
**Rationale**: Spec limits confetti to ≤50 particles and requires zero input lag. CSS animations are GPU-composited, ship with the framework, and avoid an extra dep. Canvas fallback if particle count grows, but MVP uses pure CSS.

## Data Flow

```
User tap
   ↓
[ProblemView] → answer + responseTimeMs
   ↓
[useSession hook]
   ├── engine.applyResult(state, result) → new SessionState
   ├── engine.selectNextProblem(adaptiveInput) → next Problem
   ├── scoring.computeStars(tier) → stars
   ├── scoring.getStreakBonus(streak) → bonus stars
   ├── scoring.selectMessage(...) → feedback text
   │
   ├── [useAudio] play tone (correct|incorrect|milestone)
   ├── [useTimer] continue countdown
   ├── [useStorage] persist smartick.sessionState
   └── React setState → re-render
```

On session end:
```
Timer hits 0 OR all phases complete
   ↓
engine.computeSessionResult(state) → SessionResult
   ↓
[useSession] persists:
   ├── smartick.sessions → append, cap at 30
   ├── smartick.skills → atomic update per sub-skill
   ├── smartick.settings → streakDays, lastSessionDate
   ├── smartick.badges → append new badges
   └── smartick.sessionState → DELETE key
   ↓
setView('results')
```

## Directory Structure

```
src/smartick/
├── engine/                 # Pure logic — zero React imports
│   ├── types.ts            # All types/interfaces (re-exported)
│   ├── skill-map.ts        # 8 skills, 27 sub-skills, static data
│   ├── mastery.ts          # Mastery % computation, thresholds
│   ├── adaptive.ts         # Problem selection, difficulty, rotation
│   ├── session.ts          # Session lifecycle, phase transitions
│   ├── scoring.ts          # Stars, streaks, badges, messages
│   └── problems/           # Per-sub-skill problem generators
│       ├── templates.ts    # Template registry + generator interface
│       ├── multiplication.ts
│       ├── division.ts
│       ├── geometry.ts
│       ├── measurement.ts
│       └── time-money.ts
├── audio/
│   └── sounds.ts           # Web Audio API synthesis
├── data/
│   ├── storage.ts          # localStorage service (smartick.*)
│   └── defaults.ts         # Default skill map, settings, empty state
├── hooks/
│   ├── useSession.ts       # Core session state + engine orchestration
│   ├── useTimer.ts         # Countdown 15:00 → 0:00, 1Hz
│   ├── useAudio.ts         # Play/stop tones, mute state
│   └── useStorage.ts       # Auto-load/auto-save to localStorage
├── components/
│   ├── SmartickApp.tsx     # Root: view router + Provider
│   ├── StartScreen.tsx      # "¡Comenzar!" entry
│   ├── SessionScreen.tsx   # Active session: timer + problem + feedback
│   ├── ProblemView.tsx     # Dispatches to MultipleChoice or NumericInput
│   ├── MultipleChoice.tsx  # 4-option button grid
│   ├── NumericInput.tsx    # Number input + submit
│   ├── TimerDisplay.tsx    # MM:SS countdown
│   ├── StarCounter.tsx     # Stars + streak + fire icon
│   ├── FeedbackOverlay.tsx # Correct/incorrect message + animation
│   ├── ResultsScreen.tsx   # End-of-session summary + badges + confetti
│   ├── ChildDashboard.tsx  # Home: skill rings + streak calendar
│   ├── SkillRing.tsx       # SVG circular progress (red/yellow/green)
│   ├── StreakCalendar.tsx  # 7-day activity row
│   ├── BadgeDisplay.tsx    # Badge grid
│   ├── ParentGate.tsx      # Math challenge modal
│   └── ParentView.tsx      # Analytics: summary, skills, history table
└── styles/
    └── smartick.css        # All .smartick-* styles
```

## Component Tree

```
App.tsx
└── SmartickApp (state: view)
    ├── view='dashboard'
    │   └── ChildDashboard
    │       ├── SkillRing × N (unlocked skills)
    │       ├── StreakCalendar (7-day)
    │       ├── BadgeDisplay
    │       └── button → ParentGate (math challenge)
    │           └── if passed → setView('parent')
    ├── view='session'
    │   └── SessionScreen
    │       ├── TimerDisplay (MM:SS)
    │       ├── StarCounter (stars + streak + 🔥)
    │       ├── FeedbackOverlay (message + sound)
    │       └── ProblemView
    │           ├── MultipleChoice (4 buttons)
    │           └── NumericInput (input + submit)
    ├── view='results'
    │   └── ResultsScreen (confetti + metrics + new badges)
    └── view='parent'
        └── ParentView
            ├── SessionSummaryCard (latest)
            ├── WarningList (collapsible, if ≥3 warnings)
            ├── SkillBreakdown × N (cards with trends)
            ├── TimeMetrics (today, week, comparison)
            └── SessionTable (paginated 10/page, filterable)
```

## Data Model

```typescript
// === Core Engine Types (engine/types.ts) ===

type SkillId = `skill-${string}`;
type SubSkillId = `${SkillId}-${string}`;
type Tier = 1 | 2 | 3;
type Phase = 'warmup' | 'core' | 'cooldown';
type ProblemType = 'multiple-choice' | 'numeric-input';
type View = 'dashboard' | 'session' | 'results' | 'parent';

interface SubSkillState {
  id: SubSkillId;
  name: string;
  mastered: boolean;
  accuracy: number;       // 0–100
  attempts: number;
  correctCount: number;
  totalResponseTimeMs: number;
  lastAttempts: boolean[]; // rolling window of 10 (FIFO)
}

interface SkillState {
  id: SkillId;
  name: string;
  unidad: number;         // 5–12
  trimestre: number;      // 2 | 3
  skillMastered: boolean;
  masteryPercentage: number;
  lastPracticed: string | null;
  subSkills: SubSkillState[];
}

type SkillMap = Record<SkillId, SkillState>;

interface Problem {
  skillId: SkillId;
  subSkillId: SubSkillId;
  question: string;       // Spanish
  correctAnswer: number;
  type: ProblemType;
  options?: number[];     // 4 items, randomized position
  tier: Tier;
  phase: Phase;
}

interface ProblemResult {
  problem: Problem;
  isCorrect: boolean;
  responseTimeMs: number | null;  // null = timed out
}

interface AdaptiveInput {
  skillMap: SkillMap;
  recentResults: ProblemResult[];  // last 5 per skill
  currentStreak: number;
  currentPhase: Phase;
  problemsInPhase: number;
  consecutiveSameSkill: number;
}

interface AdaptiveOutput {
  nextProblem: Problem;
}

interface SessionState {
  active: boolean;
  phase: Phase;
  elapsedSeconds: number;
  currentStreak: number;
  maxStreak: number;
  starsEarned: number;
  problemsAnswered: number;
  problemQueue: Problem[];
  results: ProblemResult[];
  startTime: string;
}

interface SessionResult {
  id: string;
  date: string;
  durationSeconds: number;
  phasesCompleted: Record<Phase, boolean>;
  accuracy: number;
  totalStars: number;
  streakMax: number;
  skillsPracticed: SkillId[];
  problems: ProblemResult[];
  badgesEarned: Badge[];
}

interface Settings {
  audioEnabled: boolean;
  language: string;
  lastSessionDate: string | null;
  streakDays: number;
  lastActivityDate: string | null;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  earnedAt: string | null;
}
```

## Engine Design (Pure Functions)

### `engine/adaptive.ts`

```typescript
// Core adaptive selection
function selectNextProblem(input: AdaptiveInput): Problem;

// Difficulty adjustment rules
function adjustDifficulty(
  subSkill: SubSkillState,
  recentErrors: number,    // consecutive errors in same sub-skill
  recentCorrect: number,   // consecutive correct in same sub-skill
  streak: number
): -1 | 0 | 1;             // tier delta

// Skill rotation — returns true if should rotate
function shouldRotateSkill(consecutiveFromSameSkill: number): boolean;

// Weighted sub-skill selection (non-mastered ×3 weight)
function selectWeightedSubSkill(skill: SkillState): SubSkillState;
```

**Selection algorithm**:
1. Get unlocked skills from `SkillMap` (progression gates)
2. Pick skill with lowest non-mastered sub-skill count (focus)
3. If 4 consecutive from same skill, rotate to next available
4. Within skill, weighted random among sub-skills (mastered weight = 1, non-mastered = 3)
5. Pick tier: start at current level, adjust via `adjustDifficulty`:
   - 2 consecutive errors → tier down
   - 4 consecutive correct with response ≤15s → tier up
   - Streak ≥6 → tier up (override)
6. Generate problem via template registry for that sub-skill + tier

### `engine/session.ts`

```typescript
function createInitialSession(startTime: Date): SessionState;
function getPhaseForElapsed(elapsedSeconds: number): Phase;
function applyResult(state: SessionState, result: ProblemResult): SessionState;
function isPhaseComplete(state: SessionState): boolean;
function isSessionComplete(state: SessionState): boolean;
function computeSessionResult(state: SessionState, skillMap: SkillMap): SessionResult;
```

### `engine/mastery.ts`

```typescript
function computeSubSkillMastery(subSkill: SubSkillState): boolean;
  // ≥80% accuracy last 10 AND avg response ≤30s

function computeSkillMastery(skill: SkillState): { percentage: number; mastered: boolean };
  // percentage = average of sub-skill accuracies
  // mastered = ≥70% sub-skills mastered (ceil(N × 0.7))

function getUnlockedSkills(skillMap: SkillMap): SkillState[];
  // Sequential within trimester at 40%
  // Cross-trimester gate: ≥3 T2 skills at ≥60%
```

### `engine/scoring.ts`

```typescript
function computeStars(tier: Tier): number;           // 1, 2, or 3
function getStreakBonus(streak: number): number;     // streak 5→1, 10→3, 15→5
function checkNewBadges(skillMap: SkillMap, settings: Settings, sessions: SessionResult[], earnedBadges: Badge[]): Badge[];
function selectMessage(resultType: 'correct' | 'incorrect' | 'streak-broken', streak: number, lastMessages: string[]): string;
```

## Session Flow (State Machine)

```
        ┌──────────────────────────────────────────────┐
        │                                              │
        v                                              │
  ┌─────────┐  click   ┌──────────┐  2min up   ┌──────┴──────┐  10min up   ┌──────────┐
  │ START   │ ──────→  │ WARMUP   │ ────────→  │    CORE     │ ────────→  │ COOLDOWN │
  │ SCREEN  │          │ (2:00)   │  OR all    │  (10:00)    │            │  (3:00)  │
  └─────────┘          │ mastered │  done ─────│ adaptive    │            │ mastered │
                       │ tier 1   │            │ problems    │            │ tier 1   │
                       └──────────┘            └─────────────┘            └─────┬────┘
                                                                                │
                                                                       timer up AND
                                                                       ≥30s cooldown
                                                                                │
                                                                                v
                                                                         ┌──────────┐
                                                                         │ RESULTS  │
                                                                         │ SCREEN   │
                                                                         └────┬─────┘
                                                                              │
                                                                     "Volver" │
                                                                              v
                                                                         ┌──────────┐
                                                                         │DASHBOARD │
                                                                         └──────────┘
```

**Edge cases**:
- **Hard stop at 0:00**: Current problem marked unanswered (`isCorrect: false`, `responseTimeMs: null`), session terminates immediately
- **Early warm-up completion**: Advance to core, but cool-down always runs ≥30s
- **Page refresh mid-session**: `smartick.sessionState` restored from localStorage; if `startTime` > 60min ago → discard
- **Normal completion**: `smartick.sessionState` key **deleted** (not set to inactive)

## Audio Design

File: `src/smartick/audio/sounds.ts`

```typescript
function createAudioContext(): AudioContext;     // Created on user gesture
function playCorrect(ctx: AudioContext): void;   // C5→E5, 200ms rising sine
function playIncorrect(ctx: AudioContext): void; // G3, 300ms gentle triangle
function playMilestone(ctx: AudioContext): void; // C5→E5→G5, 400ms sine
function setMuted(enabled: boolean): void;
```

**Trigger points**:
| Event | Sound |
|-------|-------|
| Correct answer | `playCorrect()` |
| Incorrect answer | `playIncorrect()` |
| Streak 5/10/15 | `playMilestone()` (replaces correct chime) |
| Session complete | `playMilestone()` |
| Badge earned | `playMilestone()` |

AudioContext initialized on "Comenzar" click per browser autoplay policy. Mute state persisted in `smartick.settings.audioEnabled`.

## Persistence Schema

| Key | Type | Description |
|-----|------|-------------|
| `smartick.skills` | `Record<SkillId, SkillState>` | All 8 skill states with sub-skill data |
| `smartick.sessions` | `SessionResult[]` | Last 30 sessions (FIFO) |
| `smartick.settings` | `Settings` | Audio toggle, language, streak tracking |
| `smartick.badges` | `Badge[]` | Earned badges (no duplicates) |
| `smartick.sessionState` | `SessionState \| null` | In-progress session (deleted on completion) |

Service: `src/smartick/data/storage.ts` — 10 operations per spec R7. All reads return defaults on missing/corrupted JSON. No writes outside `smartick.*` prefix.

## CSS Architecture

- **Namespace**: `.smartick-` prefix on all classes
- **File**: `src/smartick/styles/smartick.css`
- **Variables**: Extend existing `:root` from `App.css`, add smartick-specific tokens:
  ```css
  :root {
    --smartick-ring-red: #e74c3c;
    --smartick-ring-yellow: #f1c40f;
    --smartick-ring-green: #2ecc71;
    --smartick-star: #f39c12;
    --smartick-fire: #e67e22;
    --smartick-confetti-1: #ff6b6b;
    --smartick-confetti-2: #ffd93d;
    --smartick-confetti-3: #6bcb77;
    --smartick-confetti-4: #4d96ff;
  }
  ```
- **Pattern**: `.smartick-component { }`, `.smartick-component--modifier { }`
- **Animations**: CSS `@keyframes` for confetti (translate + rotate + opacity fade, ≤50 particles), star burst (`+N ⭐` scale + fade), ring fill (stroke-dashoffset), badge glow

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Unit | Engine functions (adaptive selection, mastery, scoring, session transitions) | Pure function tests — call with known inputs, assert outputs. No DOM needed. |
| Unit | Problem generators | Call each template with tier 1/2/3, verify operands in range, distractors distinct |
| Unit | Storage service (defaults, corruption, capping) | Mock localStorage, test edge cases |
| Integration | Hook + engine flow | Minimal — verify useSession dispatches engine correctly |
| Type-check | Full project | `npx tsc --noEmit` — must pass with zero errors |

No test framework installed per config. Unit tests for engine functions can run with `vitest` if added later (recommended), but for now type-checking is the only automated gate.

## Migration / Rollout

No migration required — this is a new feature in a fresh app. Existing `App.tsx` modified to render `SmartickApp` instead of the placeholder. The old placeholder is replaced; no backward compatibility needed.

## Performance Considerations

- Confetti: ≤50 DOM elements via CSS `@keyframes`, GPU-composited
- Timer: `setInterval` at 1Hz, not `requestAnimationFrame` (1s precision is sufficient per spec)
- Problem text: Static strings, no re-renders on timer ticks (memoize timer display)
- Skill rings: SVG `path` with `stroke-dashoffset` animation — one layout pass
- Session history: Paginated at 10/page, no virtual scrolling needed for 30 max sessions

## Files Changed

| File | Action | Description |
|------|--------|-------------|
| `src/App.tsx` | Modify | Replace placeholder with `<SmartickApp />` |
| `src/smartick/engine/types.ts` | Create | All TypeScript types |
| `src/smartick/engine/skill-map.ts` | Create | 8 skills, 27 sub-skills static data |
| `src/smartick/engine/mastery.ts` | Create | Mastery % computation |
| `src/smartick/engine/adaptive.ts` | Create | Problem selection + difficulty |
| `src/smartick/engine/session.ts` | Create | Session lifecycle |
| `src/smartick/engine/scoring.ts` | Create | Stars, streaks, badges, messages |
| `src/smartick/engine/problems/templates.ts` | Create | Generator registry |
| `src/smartick/engine/problems/multiplication.ts` | Create | Tiered problem templates |
| `src/smartick/engine/problems/division.ts` | Create | Tiered problem templates |
| `src/smartick/engine/problems/geometry.ts` | Create | Tiered problem templates |
| `src/smartick/engine/problems/measurement.ts` | Create | Tiered problem templates |
| `src/smartick/engine/problems/time-money.ts` | Create | Tiered problem templates |
| `src/smartick/audio/sounds.ts` | Create | Web Audio API synthesis |
| `src/smartick/data/storage.ts` | Create | localStorage service |
| `src/smartick/data/defaults.ts` | Create | Default states |
| `src/smartick/hooks/useSession.ts` | Create | Core session hook |
| `src/smartick/hooks/useTimer.ts` | Create | Countdown timer hook |
| `src/smartick/hooks/useAudio.ts` | Create | Audio playback hook |
| `src/smartick/hooks/useStorage.ts` | Create | Persistence hook |
| `src/smartick/components/SmartickApp.tsx` | Create | Root + view router |
| `src/smartick/components/StartScreen.tsx` | Create | Entry screen |
| `src/smartick/components/SessionScreen.tsx` | Create | Active session |
| `src/smartick/components/ProblemView.tsx` | Create | Problem dispatcher |
| `src/smartick/components/MultipleChoice.tsx` | Create | 4-option buttons |
| `src/smartick/components/NumericInput.tsx` | Create | Numeric input field |
| `src/smartick/components/TimerDisplay.tsx` | Create | MM:SS display |
| `src/smartick/components/StarCounter.tsx` | Create | Stars + streak |
| `src/smartick/components/FeedbackOverlay.tsx` | Create | Messages + animations |
| `src/smartick/components/ResultsScreen.tsx` | Create | Session summary |
| `src/smartick/components/ChildDashboard.tsx` | Create | Home screen |
| `src/smartick/components/SkillRing.tsx` | Create | SVG progress ring |
| `src/smartick/components/StreakCalendar.tsx` | Create | 7-day activity |
| `src/smartick/components/BadgeDisplay.tsx` | Create | Badge grid |
| `src/smartick/components/ParentGate.tsx` | Create | Math challenge modal |
| `src/smartick/components/ParentView.tsx` | Create | Analytics view |
| `src/smartick/styles/smartick.css` | Create | All smartick styles |
| `src/styles/App.css` | Modify | Add smartick CSS variables to `:root` |

**Totals**: 36 new files, 2 modified files.

## Open Questions

- None — all decisions are resolved by the specs and existing codebase patterns.
