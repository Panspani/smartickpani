# Design: Sesión Mejoras — Correction, Mini-Games, TTS, Background Music

## Technical Approach

Extend existing `SmartickApp` view state machine, `useSession` hook, and `sounds.ts` audio layer. No external dependencies. All changes are additive behind localStorage feature gates.

## Architecture Decisions

### D1: Correction Phase — new view state

**Choice**: Add `VIEWS.CORRECTION` to the existing `useReducer` state machine, between `VIEWS.RESULTS` and `VIEWS.MINIGAME`.

**Alternatives**: Embed correction in ResultsScreen as conditional.

**Rationale**: Correction is a full screen with its own lifecycle. A new view keeps ResultsScreen clean, allows independent state management, and follows the existing pattern (HOME → SESSION → RESULTS → CORRECTION → MINIGAME → HOME).

**Flow**: ResultsScreen gets a new `onCorrection(correctionProblems)` callback. If `result.problems` has incorrect answers → show correction button. CorrectionPhase renders each problem, single retry, +1⭐ per correct. On completion → `onCorrectionComplete(totalExtraStars)` → navigate to MINIGAME (or HOME if no minigame).

### D2: incorrectProblems — derived from sessionResult

**Choice**: Filter `result.problems` where `!isCorrect` at the ResultsScreen level. No new SessionResult fields.

**Alternatives**: Store `incorrectProblems[]` in SessionState/SessionResult.

**Rationale**: The data already exists in `result.problems`. Deriving avoids schema changes, persistence migration, and keeps the correction phase stateless. Single source of truth.

### D3: Mini-game routing — random selection

**Choice**: Add 2 new independent components (`LaberintoGame`, `PuzzleGame`) alongside existing Memory inside `MiniGameScreen`. MiniGameScreen randomly picks one game type on mount.

**Alternatives**: Add a game-selection menu screen.

**Rationale**: Random selection is simpler, avoids analysis-paralysis for 8-year-olds, and follows the existing pattern (Memory is hardcoded in MiniGameScreen). Menu adds unnecessary navigation.

### D4: Audio architecture — new services alongside sounds.ts

**Choice**: Create 2 new files (`audio/tts.ts`, `audio/music.ts`) as module-level singletons in the same pattern as `sounds.ts`. Extend `useAudio` hook to expose TTS + music controls.

**Alternatives**: One monolithic audio service, or React context-based.

**Rationale**: sounds.ts is already a module singleton with mute state. TTS and music follow the same pattern: shared, session-independent services. The hook pattern (`useAudio`) already exists — extend it. No context needed.

### D5: Feature gates — localStorage flags with defaults

**Choice**: Read `smartick.settings` for `correctionEnabled`, `laberintoEnabled`, `puzzleEnabled`, `ttsEnabled`, `musicEnabled`. All default `true`.

**Alternatives**: Hardcode enabled, remove later.

**Rationale**: Per-feature gates enable safe incremental rollout. If a feature causes issues, flip one key — zero code change. Consistent with existing `audioEnabled` pattern.

## Data Flow

```
SESSION ──(complete)──→ RESULTS ──(correction)──→ CORRECTION ──(done)──→ MINIGAME ──(win/skip)──→ HOME
                            │                        │                         │
                            │  (no incorrect)        │                         │
                            └────────────────────────┘                         │
                            │  (skip)                                           │
                            └──────────────────────────────────────────────────┘
```

### Correction flow detail
```
ResultsScreen
  ├─ compute incorrectProblems = result.problems.filter(p => !p.isCorrect)
  ├─ if incorrectProblems.length > 0 → show "Corregir" button
  │   → show "¿Jugar un juego?" (existing) + "Corregir y ganar estrellas ✨"
  │
  CorrectionPhase
  ├─ receives: problems[] (the incorrect ones), existingAudioContext
  ├─ for each problem: display → single attempt → +1⭐ if correct
  ├─ on complete: show summary (total extra stars)
  └─ callback → SmartickApp → navigate to MINIGAME
```

### Mini-game selection flow
```
MiniGameScreen
  ├─ on mount: pick random game type (Memory | Laberinto | Puzzle)
  ├─ render chosen game component
  ├─ on win: award stars (different per game type)
  └─ on skip: go home
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/smartick/engine/types.ts` | Modify | Add `VIEWS.CORRECTION` to view constants |
| `src/smartick/components/SmartickApp.tsx` | Modify | Add `correction` view handling + correction/minigame flow callbacks |
| `src/smartick/components/ResultsScreen.tsx` | Modify | Add correction button + `onCorrection` callback prop |
| `src/smartick/components/CorrectionPhase.tsx` | Create | Post-session correction UI: problem retry, star award, summary |
| `src/smartick/components/MiniGameScreen.tsx` | Modify | Random game-type selection, route to Laberinto/Puzzle components |
| `src/smartick/components/LaberintoGame.tsx` | Create | Number maze grid game component |
| `src/smartick/components/PuzzleGame.tsx` | Create | 3×3 sliding tile puzzle component |
| `src/smartick/audio/tts.ts` | Create | SpeechSynthesis service (singleton, module-level) |
| `src/smartick/audio/music.ts` | Create | Web Audio API background music loop service |
| `src/smartick/hooks/useAudio.ts` | Modify | Add `speak(text)`, `startMusic()`, `stopMusic()` — delegate to new services |
| `src/smartick/styles/smartick.css` | Modify | Add styles for CorrectionPhase, LaberintoGame, PuzzleGame, game selection |
| `openspec/specs/adaptive-session/spec.md` | Create | Full spec (new capability) |
| `openspec/changes/sesion-mejoras/specs/adaptive-session/spec.md` | Done | Delta spec |
| `openspec/changes/sesion-mejoras/specs/mini-games/spec.md` | Done | Delta spec |
| `openspec/changes/sesion-mejoras/specs/gamification-system/spec.md` | Done | Delta spec |

## Interfaces / Contracts

### CorrectionPhase props
```typescript
interface CorrectionPhaseProps {
  problems: Problem[];           // incorrect problems to retry
  existingStars: number;         // stars earned in session (for running total)
  onComplete: (extraStars: number) => void;  // navigate away with final count
  onSkip: () => void;            // skip correction entirely
}
```

### LaberintoGame props
```typescript
interface LaberintoGameProps {
  onWin: (stars: number) => void;
  onSkip: () => void;
}
// Internal: grid 3×3-5×5, numbers 1 to N, tap navigation
```

### PuzzleGame props
```typescript
interface PuzzleGameProps {
  onWin: (stars: number) => void;
  onSkip: () => void;
}
// Internal: 3×3 grid, tiles 1-8 + empty, slide mechanics
```

### TTS service (tts.ts)
```typescript
export function speak(text: string, rate?: number): void; // speak phrase
export function setTtsEnabled(enabled: boolean): void;     // gate
export function setSpeechMuted(muted: boolean): void;      // master mute
```

### Music service (music.ts)
```typescript
export function startMusic(audioCtx: AudioContext): void;  // start loop
export function stopMusic(): void;                         // fade+stop
export function setMusicMuted(muted: boolean): void;        // master mute
export function setMusicEnabled(enabled: boolean): void;    // gate
```

## Testing Strategy

No test framework installed — manual verification via `npx tsc --noEmit` and `npm run build`.

| Area | What to verify | Manual check |
|------|---------------|--------------|
| Correction | Problems filter correctly, +1⭐ per retry, summary screen | Play session, fail problems, verify flow |
| Laberinto | Grid renders, valid/invalid moves, win detection | Play multiple grids |
| Puzzle | Tiles shuffle, slide, hint at 30 moves, win | Play multiple times |
| TTS | Speaks on correct/incorrect/milestone, respects mute | Check browser console, listen |
| Music | Starts/ends with session, very low volume, respects mute | Listen during session |
| Feature gates | Each gate toggles independently, no cross-effects | Flip each key, verify behavior |
| Build | `npx tsc --noEmit` passes, `npm run build` succeeds | Run both commands |

## Migration / Rollout

No migration required. All new files. All behind default-enabled gates.

To roll back a feature: `localStorage.setItem('smartick.settings', JSON.stringify({...existing, featureEnabled: false}))`.

To full rollback: revert modified files, delete new files, clear localStorage.

## Open Questions

None resolved during design. Implementation notes:
- Puzzle shuffle must guarantee solvability (count inversions, avoid parity issue).
- TTS on iOS Safari requires user gesture first — sounds.ts already handles AudioContext init on gesture, TTS reads from same gesture.
- Music loop: OscillatorNode + GainNode chain. Loop with `start/end` parameters on OscillatorNode (not setPeriodicWave — too complex for MVP).
