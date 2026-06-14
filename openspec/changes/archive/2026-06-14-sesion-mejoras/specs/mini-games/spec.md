# Delta for Mini-Games

## ADDED Requirements

### Requirement: R6 — Laberinto Numérico

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

### Requirement: R7 — Puzzle (Sliding Tiles)

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

### Requirement: R8 — Mini-Game Selection

The system MUST allow selection between available mini-game types.

#### Scenario: Game type selection

- GIVEN the post-session mini-game offer is accepted
- WHEN MiniGameScreen loads
- THEN the system MUST offer: Memory (existing), Laberinto Numérico, Puzzle
- AND selection MUST be random or based on recent play history for variety

## MODIFIED Requirements

### Requirement: R4 — Star Rewards

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

## REMOVED Requirements

None — existing Memory game behavior preserved.

## Acceptance Criteria

- [ ] Laberinto Numérico: grid renders, valid/invalid move feedback, win detection, +1⭐
- [ ] Puzzle: 3×3 sliding tiles, shuffle, slide animation, win detection, hint at 30 moves
- [ ] Game type selection between Memory/Laberinto/Puzzle
- [ ] Star rewards differentiated by game type
- [ ] All existing Memory game behavior unchanged