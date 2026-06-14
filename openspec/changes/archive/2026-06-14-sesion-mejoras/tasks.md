# Tasks: Sesión Mejoras — Correction, Mini-Games, TTS, Music

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~650–850 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Delivery strategy | auto-forecast |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Suggested Work Units (Chained PRs)

| Unit | Goal | Est. Lines |
|------|------|-----------|
| 1 | Infrastructure: types + audio services (tts.ts, music.ts) | 110–140 |
| 2 | Correction Phase: component + SmartickApp wiring | 180–220 |
| 3 | Mini-games: Laberinto + Puzzle + MiniGameScreen routing | 220–280 |
| 4 | Audio Integration: useAudio wiring + TTS/music in session | 60–90 |

## Phase 1: Infrastructure

- [x] 1.1 Add `VIEWS.CORRECTION` to `types.ts` constants + `View` type
- [x] 1.2 Create `audio/tts.ts` — SpeechSynthesis service, `speak()`, `setTtsEnabled()`, `setSpeechMuted()`
- [x] 1.3 Create `audio/music.ts` — Web Audio oscillator loop, `startMusic()`, `stopMusic()`, pentatonic scale, volume 0.05

## Phase 2: Correction Phase

- [x] 2.1 Create `components/CorrectionPhase.tsx` — problem retry UI, single attempt per problem, +1⭐ on correct
- [x] 2.2 Modify `components/ResultsScreen.tsx` — add `onCorrection` prop, "Corregir y ganar estrellas ✨" button
- [x] 2.3 Modify `components/SmartickApp.tsx` — add CORRECTION view state, wire correction → minigame flow
- [x] 2.4 Add CorrectionPhase styles to `styles/smartick.css` — summary screen, retry problem display, star animation
- [x] 2.5 Track extra stars from correction in the session total (sum with existing stars)

## Phase 3: Mini-Games

- [x] 3.1 Create `components/LaberintoGame.tsx` — grid (3×3/4×4/5×5), number navigation, valid/invalid move feedback, win detection
- [x] 3.2 Create `components/PuzzleGame.tsx` — 3×3 sliding tiles, shuffle (solvable), slide animation, hint at 30 moves, win detection
- [x] 3.3 Modify `components/MiniGameScreen.tsx` — random game-type selection (Memory/Laberinto/Puzzle), route to components, star rewards per game type
- [x] 3.4 Add Laberinto + Puzzle styles to `styles/smartick.css` — grid layouts, tile animations, win overlays

## Phase 4: Audio Integration

- [ ] 4.1 Modify `hooks/useAudio.ts` — add `speak(text)`, `startMusic(audioCtx)`, `stopMusic()` methods delegating to new services
- [ ] 4.2 Wire TTS in `useSession.ts` — call `speak()` on correct/incorrect/milestone alongside existing audio chimes
- [ ] 4.3 Wire background music lifecycle — start music on session begin, stop on session end (in SmartickApp or useSession)
- [ ] 4.4 Extend mute toggle to control chimes + TTS + music uniformly

## Verification Criteria

- [ ] `npx tsc --noEmit` passes with zero errors for all new/modified files
- [ ] `npm run build` succeeds
- [ ] CorrectionPhase only appears when there are incorrect answers
- [ ] Laberinto: grid renders, valid/invalid moves work, win detection fires
- [ ] Puzzle: tiles slide, hint appears at 30 moves, win detected correctly
- [ ] TTS speaks in es-AR on correct/incorrect/milestone, respects mute
- [ ] Music plays during session, stops at results, respects mute + musicEnabled
- [ ] All feature gates work independently (correctionEnabled, ttsEnabled, musicEnabled, laberintoEnabled, puzzleEnabled)
