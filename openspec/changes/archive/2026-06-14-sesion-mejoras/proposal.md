# Proposal: Sesión Mejoras (Post-Session Correction + Mini-Games + TTS + Music)

## Intent

Make the post-session experience richer and more motivating for Ana (8yo):
- **Smartick-style correction**: show correct answer on error, retry failures at session end for +⭐
- **Two new mini-games**: Laberinto numérico (number path) and Puzzle (3×3 sliding tiles)
- **TTS vocal feedback**: browser speech synthesis for encouragement messages
- **Background music**: soft procedural audio loop during sessions

No change to core adaptive engine, scoring, or persistence schema.

## Scope

### In Scope
- New `CorrectionPhase` component between `ResultsScreen` and mini-game offer
- `incorrectProblems[]` tracking in session state (filtered from `ProblemResult[]`)
- Laberinto numérico: grid-based number-path navigation game
- Puzzle: 3×3 sliding tile game with number tiles
- TTS service layer wrapping `window.speechSynthesis`, wired into feedback hooks
- Background music service: Web Audio API `OscillatorNode`-based loop (8–16 bars)
- Feature gates via `smartick.settings.*` localStorage keys
- Mute toggle integration for TTS and music

### Out of Scope
- Multi-language TTS (es-AR only for MVP)
- Procedural music generation beyond one loop
- New mini-game types beyond Laberinto and Puzzle
- Session result schema changes (correction uses existing fields)

## Capabilities

### New
None — all features land in existing capabilities.

### Modified
- **`mini-games`**: Add Laberinto numérico and Puzzle game types to the mini-game slot. Spec update: game type selection, new game mechanics.
- **`gamification-system`**: Add TTS vocal feedback (SpeechSynthesis) and background music (Web Audio oscillator loop). Spec update: new feedback channels, mute integration.
- **`adaptive-session`**: Add correction phase post-session — retry of failed problems for extra stars. Spec update: post-result flow, correction-specific messages.

## Approach

| Feature | Approach |
|---------|----------|
| **Correction** | New `CorrectionPhase` component. After `ResultsScreen` → if `incorrectProblems.length > 0`, show correction. Each retry is a single attempt; correct = +1⭐, wrong = skip. After correction → mini-game offer or dashboard. |
| **Laberinto** | New standalone game component. Grid rendering (CSS Grid), tap-to-move navigation. Numbers 1–N placed on grid, child taps the next number in sequence. Difficulty = grid size. |
| **Puzzle** | New standalone game component. 3×3 grid, number tiles 1–8 + empty slot. Tap adjacent tile to slide. Drag-to-move optional. Shuffle on start. Win = ordered sequence + confetti. |
| **TTS** | `src/smartick/audio/tts.ts` — thin service wrapping `window.speechSynthesis`. `speak(text, rate?)` function. Hook `useTts` calls it on feedback events. Respects existing `audioEnabled` mute flag. |
| **Music** | `src/smartick/audio/music.ts` — Web Audio API `OscillatorNode` + `GainNode` loop. Procedural sequence of tones (pentatonic scale). Volume ~0.05 (very low). Starts on session start, stops on session end. Toggle via mute button or `smartick.settings.musicEnabled`. |

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/smartick/engine/types.ts` | Modified | Add `incorrectProblems` view in post-result flow |
| `src/smartick/components/SmartickApp.tsx` | Modified | Add `correction` view, wire correction flow |
| `src/smartick/components/ResultsScreen.tsx` | Modified | Conditionally show correction button before mini-game offer |
| `src/smartick/components/CorrectionPhase.tsx` | New | Post-session retry UI |
| `src/smartick/components/LaberintoGame.tsx` | New | Number maze game |
| `src/smartick/components/PuzzleGame.tsx` | New | Sliding tile puzzle |
| `src/smartick/components/MiniGameScreen.tsx` | Modified | Game type routing (Memory/Laberinto/Puzzle) |
| `src/smartick/audio/tts.ts` | New | SpeechSynthesis service |
| `src/smartick/audio/music.ts` | New | Background music loop |
| `src/smartick/hooks/useAudio.ts` | Modified | Add TTS + music controls |
| `src/smartick/hooks/useTts.ts` | New | TTS feedback hook |
| `src/smartick/hooks/useBackgroundMusic.ts` | New | Music lifecycle hook |
| `src/smartick/styles/smartick.css` | Modified | New game component styles |
| `openspec/specs/mini-games/spec.md` | Modified | Delta spec for new games |
| `openspec/specs/gamification-system/spec.md` | Modified | Delta spec for TTS + music |
| `openspec/specs/adaptive-session/spec.md` | Modified | Delta spec for correction phase |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| TTS not supported on all browsers (Safari iOS) | Low | Graceful fallback — silence if `speechSynthesis` absent |
| Background music loop is annoying to some kids | Low | Separate toggle, low default volume |
| Puzzle game too hard for 8yo | Low | Show solution hint after 30 moves |
| Correction phase makes session feel punitive | Low | Framing: "¡Ahora podés ganar más estrellas!" |

## Rollback Plan

Each feature has its own gate key:
- `smartick.settings.correctionEnabled` (default: true)
- `smartick.settings.laberintoEnabled` (default: true)
- `smartick.settings.puzzleEnabled` (default: true)
- `smartick.settings.ttsEnabled` (default: true)
- `smartick.settings.musicEnabled` (default: true)

Setting any to `false` reverts to pre-existing behavior for that feature. Rollback is per-feature, zero-regression. For full rollback: revert modified files, delete new files.

## Dependencies

- `window.SpeechSynthesis` (browser API, no polyfill)
- Existing `AudioContext` from sounds.ts (shared, not duplicated)

## Success Criteria

- [ ] Post-session correction: failed problems are retryable with star reward
- [ ] Laberinto numérico: playable, difficulty scales with grid size
- [ ] Puzzle: 3×3 sliding tiles, win detection, confetti on completion
- [ ] TTS: "¡Muy bien!" plays on correct, respects mute toggle
- [ ] Music: plays during session, stops on session end, togglable
- [ ] `npx tsc --noEmit` passes with zero errors
- [ ] All feature gates work independently with no cross-effects
