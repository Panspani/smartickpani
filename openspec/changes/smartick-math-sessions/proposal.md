# Proposal: Smartick Math Sessions

## Intent
Build an adaptive math learning app for Ana (8yo) following Smartick — daily 15-min sessions, AI personalization, skill progression, gamification. Replaces the simple quiz in `App.tsx` with a full session system covering 8 units of 3rd grade math.

## Scope
### In Scope
- Session system (15-min timer, warm-up/core/cool-down)
- Skill map of 8 units (multiplication, division, geometry, measurement, time/money)
- Adaptive engine (selects problems by accuracy, response time, streak)
- Problem types: multiple choice + numeric input
- Gamification: stars, streaks, confetti, Web Audio feedback, encouraging messages
- Progress dashboard (per-skill mastery)
- Parent view (session history, skill progress)
- localStorage persistence

### Out of Scope
Multi-child profiles, backend/accounts, full curriculum beyond 8 units, leaderboards, native mobile

## Capabilities
### New
- **skill-map**: 8 skills with sub-skills, mastery thresholds, progression rules
- **adaptive-session**: timed sessions with warm-up/core/cool-down + real-time problem selection
- **problem-engine**: multi-choice + numeric-input per skill with difficulty tiers
- **gamification-system**: stars, streaks, badges, confetti, audio, encouraging messages
- **progress-dashboard**: skill progress visualization (child) + detailed history (parent)
- **parent-view**: session summary, performance, time metrics
- **persistence-layer**: localStorage schema for all user data, session history, skill state

### Modified
None — new app, no existing specs.

## Approach
New feature in existing Vite + React 19 app. State-based navigation (no router). New `src/smartick/` with `engine/`, `components/`, `hooks/`, `types/`, `audio/`, `data/`. Existing `App.tsx` untouched — smartick mounts at separate route. Adaptive engine is pure logic (zero React deps) for testability. Audio reuses Web Audio API from sumas-lola. localStorage via thin service layer. Namespace CSS with `.smartick-` prefix.

## Affected Areas
| Area | Impact |
|------|--------|
| `src/smartick/` | New — full app |
| `src/App.tsx` | Modified — add entry |
| `src/styles/` | Modified — smartick CSS |
| `openspec/specs/` | New — 7 specs |

## Risks
| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Adaptive engine too complex for MVP | Med | Start rule-based, evolve later |
| localStorage limit with history | Low | Cap to last 30 sessions |
| CSS conflicts with existing | Low | `.smartick-` namespace |

## Rollback Plan
Revert `App.tsx` changes. Delete `src/smartick/`. Separate localStorage keys (`smartick.*` namespace) — zero data loss for existing app.

## Dependencies
React 19 + TypeScript 6 + Vite 8 (already installed). Zero external deps for MVP.

## Success Criteria
- [ ] Ana completes a full 15-min session with all 3 phases (warm-up, core, cool-down)
- [ ] Adaptive engine shows easier problems after 2 consecutive errors per skill
- [ ] Session history survives page reload (localStorage)
- [ ] Audio feedback plays on correct/incorrect answers
- [ ] Parent view shows skills practiced + accuracy per session
- [ ] `npm run build` succeeds with zero TypeScript errors
