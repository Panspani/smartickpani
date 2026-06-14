# Mini-Games Specification

## Purpose

Define a post-session mini-game (Memory, Laberinto Numérico, Puzzle) with star rewards, celebration animations, and session-to-dashboard transition flow.

## Requirements

### R1: MiniGameScreen Entry

The system MUST offer a mini-game after each session. The child MAY choose to play or skip.

#### Scenario: Post-session offer

- GIVEN Ana completes a full session (all problems answered)
- WHEN the session summary is displayed
- THEN a prompt MUST appear: "¿Jugar un juego?" with two buttons: "¡Sí!" and "Volver al inicio"
- AND tapping "¡Sí!" MUST navigate to MiniGameScreen
- AND tapping "Volver al inicio" MUST navigate to the dashboard
- AND the offer MUST NOT block access to session results

#### Scenario: Skip navigates to dashboard

- GIVEN Ana taps "Volver al inicio"
- WHEN the skip action is confirmed
- THEN the system MUST navigate to the child dashboard immediately
- AND no mini-game state MUST be initialized

### R2: Memory Game

The system MUST implement a Memory card-flip game on a 4×4 grid (16 cards, 8 pairs). Pairs SHALL use number representations or geometric shapes.

#### Scenario: Game initialization

- GIVEN MiniGameScreen loads
- WHEN the game starts
- THEN a 4×4 grid MUST render with 16 face-down cards
- AND each card MUST belong to exactly one pair (8 pairs total)
- AND cards MUST be shuffled randomly each game
- AND pair values SHALL be number+quantity matches (e.g., "5" card + "•••••" card) or matching shapes

#### Scenario: Card flip

- GIVEN the grid is displayed
- WHEN Ana taps a face-down card
- THEN the card MUST flip with a 180° rotation animation (≤400ms)
- AND reveal the card's value

#### Scenario: Matching pair

- GIVEN Ana has flipped two cards face-up
- WHEN both cards show the same value
- THEN the pair MUST remain face-up
- AND a visual success indicator MUST play (cards glow green, brief pulse)
- AND the cards MUST be disabled from further interaction

#### Scenario: Mismatched pair

- GIVEN two flipped cards do NOT match
- WHEN the mismatch is detected
- THEN both cards MUST flip back face-down after a 1-second delay
- AND the player's total moves COUNTER increments

#### Scenario: Win condition

- GIVEN all 8 pairs have been matched
- WHEN the last pair is revealed
- THEN a celebration animation MUST play (confetti burst)
- AND the system MUST display: "¡Ganaste! +2 ⭐"
- AND the stars MUST be awarded immediately

### R3: Grid Size Flexibility

The system MAY support a 4×3 grid (6 pairs, 12 cards) as a fallback for smaller screens.

#### Scenario: 4×3 fallback

- GIVEN the viewport width is < 360px
- WHEN MiniGameScreen initializes
- THEN the grid SHALL use 4×3 layout with 6 pairs
- AND all game mechanics remain identical

### R4: Star Rewards

The system MUST award stars based on the specific game type and performance.
(Previously: +2 stars for Memory win, 0 otherwise)

#### Scenario: Star awards by game

- GIVEN Ana wins a mini-game
- WHEN the win is detected
- THEN star awards SHALL be:
  - Memory: +2 ⭐ (unchanged)
  - Laberinto Numérico: +1 ⭐
  - Puzzle: +1 ⭐ (or +2 ⭐ if solved in <30 moves)

#### Scenario: No stars on quit

- GIVEN Ana quits any mini-game mid-play
- WHEN returning to dashboard
- THEN zero stars MUST be awarded for that game

### R5: Celebration Animations

The system MUST play celebration animations on winning the mini-game.

#### Scenario: Win screen

- GIVEN Ana wins the memory game
- WHEN the win state triggers
- THEN confetti MUST play (≤30 particles, ≤2 seconds)
- AND MonsterDisplay (if available) MUST show `celebration` state
- AND a "¡Ganaste!" banner MUST render centered with a bounce-in animation

### R6: Laberinto Numérico

The system MUST implement a number maze navigation game where the child traces a path from 1 to N on a grid.

#### Scenario: Game initialization

- GIVEN MiniGameScreen loads with Laberinto Numérico selected
- WHEN the game starts
- THEN a square grid MUST render (3×3, 4×4, or 5×5 based on difficulty)
- AND cells MUST contain shuffled numbers from 1 to N (N = grid size²)
- AND the starting cell (number 1) MUST be highlighted as current position

#### Scenario: Valid move

- GIVEN the game is active and Ana is at number K
- WHEN Ana taps an adjacent cell (up/down/left/right) containing number K+1
- THEN the player position MUST move to that cell
- AND the cell MUST highlight green briefly
- AND the previous cell MUST return to neutral state

#### Scenario: Invalid move

- GIVEN Ana is at number K
- WHEN Ana taps a non-adjacent cell or a cell not containing K+1
- THEN the tapped cell MUST flash red briefly (≤300ms)
- AND the player position MUST NOT change
- AND a wrong-move counter SHOULD increment

#### Scenario: Win condition

- GIVEN Ana reaches the cell containing the maximum number N
- WHEN the final number is reached
- THEN a celebration animation MUST play (confetti burst, ≤30 particles, ≤2 seconds)
- AND the system MUST display: "¡Ganaste! +1 ⭐"
- AND exactly 1 star MUST be awarded

#### Scenario: Difficulty tiers

- GIVEN the game starts
- WHEN the grid size is determined
- THEN difficulty SHALL be: 3×3 (numbers 1-9) for beginners, 4×4 (1-16) for intermediate, 5×5 (1-25) for advanced
- AND grid size MAY be selected based on session performance or random

### R7: Puzzle (Sliding Tiles)

The system MUST implement a 3×3 sliding tile puzzle with numbered tiles.

#### Scenario: Game initialization

- GIVEN MiniGameScreen loads with Puzzle selected
- WHEN the game starts
- THEN a 3×3 grid MUST render with tiles numbered 1-8 and one empty slot
- AND tiles MUST be randomly shuffled (ensuring solvable configuration)
- AND the empty slot MUST be visually distinct

#### Scenario: Tile slide

- GIVEN the puzzle is displayed
- WHEN Ana taps a tile adjacent to the empty slot
- THEN that tile MUST slide into the empty slot with a smooth animation (≤200ms)
- AND the move counter MUST increment

#### Scenario: Win detection

- GIVEN Ana arranges tiles in order 1-8 with empty slot at bottom-right
- WHEN the win condition is detected
- THEN a celebration animation MUST play (confetti burst)
- AND the system MUST display: "¡Ganaste! +1 ⭐" (or +2 ⭐ if under 30 moves)
- AND stars MUST be awarded accordingly

#### Scenario: Hint system

- GIVEN Ana has made ≥30 moves without solving
- WHEN the hint threshold is reached
- THEN a "¿Necesitás ayuda?" button MUST appear
- AND tapping it MUST highlight the correct next tile to move

### R8: Mini-Game Selection

The system MUST allow selection between available mini-game types.

#### Scenario: Game type selection

- GIVEN the post-session mini-game offer is accepted
- WHEN MiniGameScreen loads
- THEN the system MUST offer: Memory (existing), Laberinto Numérico, Puzzle
- AND selection MUST be random or based on recent play history for variety

## Acceptance Criteria

- [ ] Post-session offer with play/skip buttons
- [ ] 4×3 or 4×4 memory grid with shuffled pairs
- [ ] Card flip animation (≤400ms)
- [ ] Match and mismatch visual feedback
- [ ] +2 stars on Memory win, +1 on Laberinto, +1/+2 on Puzzle
- [ ] Confetti celebration on win
- [ ] Skip → dashboard, Play → MiniGameScreen
- [ ] Laberinto Numérico: grid renders, valid/invalid move feedback, win detection, +1⭐
- [ ] Puzzle: 3×3 sliding tiles, shuffle, slide animation, win detection, hint at 30 moves
- [ ] Game type selection between Memory/Laberinto/Puzzle
- [ ] Star rewards differentiated by game type
- [ ] All existing Memory game behavior unchanged
