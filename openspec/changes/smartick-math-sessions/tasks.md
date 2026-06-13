# Tasks: Smartick Math Sessions

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~3,350 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | 5 stacked PRs → main |
| Delivery strategy | ask-on-risk |
| Chain strategy | stacked-to-main (pending user confirmation) |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | PR | Base |
|------|------|----|------|
| 1 | Engine core (types, skill-map, mastery, session, adaptive, scoring) — pure functions, zero React deps | PR #1 | main |
| 2 | Problem generators + audio (templates registry, 6 domain generators, sounds.ts) | PR #2 | main |
| 3 | Data layer + hooks (storage, defaults, useTimer, useAudio, useStorage, useSession) | PR #3 | main |
| 4 | UI Components (SmartickApp, screens, all child components) | PR #4 | main |
| 5 | Styles + integration (smartick.css, App.tsx/App.css wiring, build check) | PR #5 | main |

Each PR is independent enough to merge directly to main sequentially. No feature branch needed — stacking is for review order, not code coupling. If reviewer capacity is tight, PR #1 and PR #5 can be reviewed standalone; PR #2–#4 are larger and may need more attention.

## Phase 1: Foundation

- [ ] 1.1 `engine/types.ts` — all types: SkillId, SubSkillId, Tier, Phase, Problem, SessionState, SkillMap, etc.
- [ ] 1.2 `engine/skill-map.ts` — static data: 8 skills, 27 sub-skills with Spanish names, trimestre, sub-skill breakdown
- [ ] 1.3 `engine/mastery.ts` — `computeSubSkillMastery()`, `computeSkillMastery()`, `getUnlockedSkills()` with progression rules
- [ ] 1.4 `engine/session.ts` — `createInitialSession()`, `applyResult()`, `getPhaseForElapsed()`, `computeSessionResult()`, edge cases (hard stop, stale)
- [ ] 1.5 `engine/adaptive.ts` — `selectNextProblem()`, `adjustDifficulty()`, `shouldRotateSkill()`, `selectWeightedSubSkill()`
- [ ] 1.6 `engine/scoring.ts` — `computeStars()`, `getStreakBonus()`, `checkNewBadges()`, `selectMessage()` with 10+ message pools

## Phase 2: Problem Generators

- [ ] 2.1 `engine/problems/templates.ts` — Generator interface, registry map, seed-based reproducibility, context rotation
- [ ] 2.2 `engine/problems/multiplication.ts` — 4 sub-skills × 3 tiers: tablas, 1-cifra, 2-cifras, word problems + distractors
- [ ] 2.3 `engine/problems/division.ts` — 3 sub-skills × 3 tiers: exactas, relación, word problems + missing-factor format
- [ ] 2.4 `engine/problems/division-remainder.ts` — 3 sub-skills × 3 tiers: con resto, 2-cifras, word problems
- [ ] 2.5 `engine/problems/geometry.ts` — 3 sub-skills × 3 tiers: shape classification, perimeter, symmetry + property questions
- [ ] 2.6 `engine/problems/measurement.ts` — 3 sub-skills × 3 tiers: m/cm/mm, conversions, estimation
- [ ] 2.7 `engine/problems/time-money.ts` — 4 sub-skills × 3 tiers: clock reading, hours/minutes, euros/cents, money word problems

## Phase 3: Audio & Persistence

- [ ] 3.1 `audio/sounds.ts` — `createAudioContext()`, `playCorrect()` (C5→E5), `playIncorrect()` (G3), `playMilestone()` (C5→E5→G5), `setMuted()`
- [ ] 3.2 `data/storage.ts` — 10-method service: getSkillState, updateSkillState, getSessions, saveSession, getSettings, updateSettings, getBadges, awardBadge, saveSessionState, clearSessionState, getSessionState. Corruption-safe, 30-session cap
- [ ] 3.3 `data/defaults.ts` — Default SkillMap (all 8 skills), Settings, empty Badges/Sessions arrays

## Phase 4: Hooks

- [ ] 4.1 `hooks/useTimer.ts` — 15-min countdown, MM:SS display, 1Hz setInterval, `elapsedSeconds` ref, auto-clear on unmount
- [ ] 4.2 `hooks/useAudio.ts` — Wraps sounds.ts, lazy AudioContext on user gesture, mute toggle from settings, play/stop control
- [ ] 4.3 `hooks/useStorage.ts` — Auto-loads all localStorage keys on mount, auto-saves on deps change, stale session detection (>60min)
- [ ] 4.4 `hooks/useSession.ts` — Core orchestrator: connects engine + useTimer + useAudio + useStorage, exposes current problem, submitAnswer(), phase/streak/stars state

## Phase 5: UI Components — Shell & Session

- [ ] 5.1 `components/SmartickApp.tsx` — Root: view `useReducer` ('dashboard' | 'session' | 'results' | 'parent'), pass-through provider
- [ ] 5.2 `components/StartScreen.tsx` — "¡Comenzar!" button, initializes AudioContext on click, triggers session start
- [ ] 5.3 `components/SessionScreen.tsx` — Active session: TimerDisplay + StarCounter + ProblemView + FeedbackOverlay, wired to useSession
- [ ] 5.4 `components/ProblemView.tsx` — Dispatches to MultipleChoice or NumericInput based on problem.type
- [ ] 5.5 `components/MultipleChoice.tsx` — 4 buttons in 2×2 grid, random option position, disabled after answer, highlights correct/incorrect
- [ ] 5.6 `components/NumericInput.tsx` — Text input (numeric only), "Solo números" validation, leading zero tolerant
- [ ] 5.7 `components/TimerDisplay.tsx` — MM:SS, red flash at <60s, memoized to avoid re-render on unrelated state changes
- [ ] 5.8 `components/StarCounter.tsx` — Star icon + count, streak count + fire icon, +N popup animation on star award
- [ ] 5.9 `components/FeedbackOverlay.tsx` — Correct/incorrect message from pool, auto-fades after 1.5s, streak-milestone popup
- [ ] 5.10 `components/ResultsScreen.tsx` — Session summary metrics, new badges with glow animation, confetti, "Volver" button

## Phase 6: UI Components — Dashboard & Parent

- [ ] 6.1 `components/ChildDashboard.tsx` — Home screen: unlocked skill rings grid, streak calendar, badge display, "Vista de padres" button
- [ ] 6.2 `components/SkillRing.tsx` — SVG circle with stroke-dashoffset, color bands (red/yellow/green), animated fill, sub-skill expand on tap
- [ ] 6.3 `components/StreakCalendar.tsx` — 7-day row with check/cross, "Racha: N días 🔥" counter, encouraging message if empty
- [ ] 6.4 `components/BadgeDisplay.tsx` — Grid of earned badges with name + description, shimmer for unearned
- [ ] 6.5 `components/ParentGate.tsx` — Modal with random addition (3–20), numeric input, retry on wrong, Cancel + Escape dismissal
- [ ] 6.6 `components/ParentView.tsx` — Session summary card, skill breakdown with trend indicators, time metrics, warning collapsible, session table (10/page, drill-down, filters)

## Phase 7: Styles & Integration

- [ ] 7.1 `styles/smartick.css` — All `.smartick-*` styles: grid layouts, skill ring dimensions, confetti @keyframes, star burst, feedback overlay, modal, table, responsive breakpoints
- [ ] 7.2 Modify `src/styles/App.css` — Add `:root` CSS variables: --smartick-ring-red/yellow/green, --smartick-star, --smartick-fire, --smartick-confetti-*
- [ ] 7.3 Modify `src/App.tsx` — Replace placeholder `<h1>` with `<SmartickApp />`, wrap in context if needed
- [ ] 7.4 Build check — `npm run build` succeeds with zero TypeScript errors, fix any import/type issues

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Engine hooks integration too complex for one session (4.4) | Split: first wire without persistence, add useStorage integration after |
| CSS confetti animation perf on low-end device | Cap at 50 particles, GPU composited transforms only |
| Session state recovery edge cases (stale >60min + page refresh race) | useStorage handles staleness check before mount |
| 5 chained PRs may feel heavy for solo dev | PRs can merge to main independently; no blocking dependencies between them |
