# Proposal: Smartick-Style Visual + Engagement Redesign

## Intent

MateSmart's current UI uses purple (#6C5CE7) as primary — the real Smartick uses orange (#FF6B35). Beyond color, the app lacks key engagement features: a mascot character, adventure theme, micro-celebrations, and post-session rewards. This change bridges the visual gap with Smartick and adds the motivational layer kids need to stay engaged.

## Scope

### In Scope
- PR #1 (~400 lines): Color palette migration (purple→orange), adventure/pirate theme (icons, SVG decor), mini-confetti per correct answer, mute button in top bar, improved audio (TTS/samples)
- PR #2 (~350 lines): Monster mascot component (idle/happy/sad/thinking/celebration), mascot in SessionScreen/FeedbackOverlay/ResultsScreen, interactive ClockDisplay, 3-screen onboarding carousel
- PR #3 (~400+ lines): Mini-game screen (memory), session→minigame→dashboard transition, star rewards for minigames, celebration animations

### Out of Scope
- Step-by-step tutorials on error (gap 8 — deferred to future change)
- Routing library or SSR (app stays SPA)
- External auth, multiplayer, or backend

## Capabilities

### New Capabilities
- `monster-mascot`: animated companion with 5 states reacting to session events
- `mini-games`: post-session memory/number game with star rewards
- `onboarding-flow`: 3-screen carousel shown on first launch

### Modified Capabilities
- `gamification-system`: add per-answer micro-celebrations (mini-confetti), improve audio to TTS/playback samples
- `progress-dashboard`: color palette CSS variables (purple→orange), adventure theme decor

## Approach

**Delivery**: 3 chained PRs via feature-branch-chain, each building on the previous. PR #1 targets `feature/smartick-style`, PR #2 targets PR #1's branch, PR #3 targets PR #2's branch. All merge to `feature/smartick-style`, then to main.

**PR #1 flow**: Replace CSS variables → add theme decor → integrate mini-confetti in FeedbackOverlay → expose mute toggle (useAudio → UI) → upgrade audio layer.

**PR #2 flow**: Create MonsterDisplay with SVG states → hook into session events (correct/incorrect/streak) → make ClockDisplay tappable → build OnboardingCarousel with localStorage gate.

**PR #3 flow**: Create MiniGameScreen with memory game → add session-end transition → star reward logic → confetti/celebration on complete.

## Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Palette source | Smartick actual: #FF6B35 primary | Match user expectation from reference |
| Mascot rendering | Inline SVG, no external assets | Zero network, no licensing, fast |
| Audio upgrade | Base64-encoded short samples | Better quality than synthesis, tiny size |
| Onboarding gate | localStorage `smartick.onboardingDone` | One-time, survives refresh |
| Minigame reward | +2 stars per win, no cap | Encourages play without unbalancing progression |
| Mini-confetti | Reuse existing canvas confetti, fewer particles | Consistent implementation, ≤20 particles per burst |

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Orange palette clashes with existing problem displays | Low | Test all problem types, adjust component backgrounds |
| Mascot SVG animations cause layout shift | Low | Use `position: absolute` with fixed container dimensions |
| Audio samples increase bundle | Low | Keep samples under 50 KB total, lazy-load |

## Rollback Plan

Per PR: revert the merge commit. CSS variables revert automatically. Component deletions are safe since no existing code depends on them. For feature branch, delete `feature/smartick-style` and reset main.

## Dependencies

- None external. All work is within existing React + CSS codebase.

## Success Criteria

- [ ] Primary color changed from #6C5CE7 to #FF6B35 across all components
- [ ] MonsterDisplay renders in SessionScreen, FeedbackOverlay, ResultsScreen with correct states
- [ ] Mini-confetti plays on each correct answer (≤20 particles, ≤1s)
- [ ] Mute button visible and functional in session top bar
- [ ] 3-screen onboarding shows once on first launch, never again
- [ ] Memory minigame playable post-session with star reward
- [ ] `npm run build` succeeds with no type errors
- [ ] All existing session/adaptive/scoring logic unchanged (regression-free)
