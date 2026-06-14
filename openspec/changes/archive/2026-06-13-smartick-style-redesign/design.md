# Design: Smartick-Style Redesign

## Technical Approach

3 incremental PRs on `feature/smartick-style`. Palette swap first (CSS variables), then mascot/interactivity (new components), then minigame flow (new view). Zero backend changes. All new assets inline (Base64 audio, inline SVG, CSS keyframes).

## Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Audio | Base64 PCM in `sounds.ts` (same API) | Better quality than synth, <50 KB total, no consumer changes |
| Mascot | Inline SVG + CSS state machine | Zero network, ≤5 KB/state, natural CSS transitions |
| Routing | Extend reducer (add MINIGAME to VIEWS) | 4 new lines, consistent pattern |
| Onboarding | SmartickApp wrapper checks localStorage | Simplest — gate is outermost concern |
| Mini-confetti | Reuse CSS confetti keyframes | ≤20 particles, 1s, existing infra |
| Grid responsive | `@media (max-width: 360px)` → 4×3 | Pure CSS, zero JS cost |

## Component Tree

```
SmartickApp (gate: onboarding? → OnboardingCarousel : view router)
├── OnboardingCarousel          [NEW]
├── ChildDashboard              [MOD] orange primary, SVG decor, themed labels
├── SessionScreen               [MOD] +MonsterDisplay, +MuteButton
│   ├── TimerDisplay            [unchanged]
│   ├── StarCounter             [unchanged]
│   ├── MonsterDisplay          [NEW]
│   ├── ProblemView → ClockDisplay   [MOD] interactive tap
│   └── FeedbackOverlay         [MOD] +MonsterDisplay, +MiniConfetti
├── ResultsScreen               [MOD] +MonsterDisplay celebration, +"¿Jugar?" prompt
├── MiniGameScreen              [NEW] memory 4×4/4×3 grid
├── ParentGate                  [unchanged]
└── ParentView                  [unchanged]
```

## File Changes

| File | Action | Key change |
|------|--------|------------|
| `styles/smartick.css` | Modify | Orange vars, adventure decor, mascot/memory animations |
| `audio/sounds.ts` | Modify | Base64 decode replaces tone() synthesis (same API) |
| `components/SessionScreen.tsx` | Modify | +MonsterDisplay bottom-right, +MuteButton top-bar |
| `components/FeedbackOverlay.tsx` | Modify | +MonsterDisplay, mini-confetti if type==='correct' |
| `components/ResultsScreen.tsx` | Modify | +MonsterDisplay celebration, "¿Jugar?" button row |
| `components/ClockDisplay.tsx` | Modify | `interactive` prop + `onHourSelect` callback |
| `engine/types.ts` | Modify | +MINIGAME in VIEWS constant |
| `components/MonsterDisplay.tsx` | Create | 5 inline SVG states + CSS animations |
| `components/MuteButton.tsx` | Create | SVG speaker icon, connects useAudio |
| `components/MiniConfetti.tsx` | Create | ≤20 particles, reuses smartick-confetti keyframes |
| `components/OnboardingCarousel.tsx` | Create | 3 screens, swipe + button nav, localStorage gate |
| `components/MiniGameScreen.tsx` | Create | Memory grid, flip/match/reward logic |

## Component Specifications

**MonsterDisplay** — `Props: { state: 'idle'|'happy'|'sad'|'thinking'|'celebration' }`. Fixed `80×100px` container, `position: absolute`, `z-index: 50`. All transitions return to idle after 2-3s timer. CSS: idle→bob, happy→bounce, sad→droop, celebration→jump.

**MuteButton** — `Props: { isMuted: boolean; onToggle: () => void }`. SVG two-path speaker icon. SessionScreen wires `useAudio().isMuted + toggleMute`.

**ClockDisplay (interactive)** — `interactive` prop + `onHourSelect` callback. Tap cycles hour 1→12, hand updates real-time. Parent compares to `ClockVisual.hour`.

**MiniGameScreen** — `onWin(+2)` / `onSkip()` callbacks. 4×4 grid (4×3 via `@media`). Values: number + quantity dots. CSS `rotateY(180deg)` 400ms flip. Match→glow, mismatch→1s→flip back. Win: confetti + "¡Ganaste!" +2⭐.

**OnboardingCarousel** — `Props: { onComplete: () => void }`. 3 screens: welcome+mascot, how-it-works, "¿Listo?". Swipe touch (50px threshold) + button nav. On "¡Comenzar!" → `localStorage.set('smartick.onboardingDone','true')` → call onComplete.

## Audio Architecture

Refactor `sounds.ts` internals only — public API unchanged. Pre-encode 5 short WAV samples (8 kHz, 8-bit mono, ≤400ms) as Base64 strings. On first `ensureAudio()`, decode all into `AudioBuffer` cache. Each `playSample(name)` creates `BufferSourceNode` + `start()`. Total <50 KB bundle. Same lazy-init, same `setMuted`/`isMuted` gate.

## Mascot State Machine

```
mount → idle ← auto-return (2-3s)
  ├── correct → happy (2s) → idle
  ├── incorrect → sad (2s) → idle
  ├── new-problem → thinking (3s) → idle
  └── streak≥5 | session-end → celebration (3s) → idle
```

## Testing Strategy

| Layer | What | How |
|-------|------|-----|
| Unit | sounds.ts Base64 decode + play | Mock AudioContext, verify source.start() |
| Unit | MonsterDisplay states | Render 5 states, assert CSS classes |
| Unit | MiniGameScreen match/mismatch | Click cards, verify state transitions |
| Integration | MuteButton in SessionScreen | Click mute, verify audio.play* no-ops |
| E2E | Onboarding → dashboard | Clear localStorage, navigate, verify gate persist |
| E2E | Session → minigame → stars | Complete session, play minigame, verify +2 stars |

## Migration

| Step | PR | Change | Risk |
|------|----|--------|------|
| 1 | #1 | CSS vars + MiniConfetti + MuteButton + sounds.ts | Low — additive + same API |
| 2 | #2 | MonsterDisplay + ClockDisplay + Onboarding | Medium — new component lifecycle |
| 3 | #3 | MINIGAME view + MiniGameScreen + reward flow | Medium — new route |

Rollback: revert merge commit. CSS vars reverse automatically, new components have zero dependents.

## Open Questions

- [ ] Generate actual Base64 WAV samples — need `sox` or online tool
- [ ] MonsterDisplay SVG art direction — cute vs. abstract style
