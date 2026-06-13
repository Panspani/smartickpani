# Problem Engine Specification

## Purpose

Define the problem generation system that produces multiple-choice and numeric-input problems for each skill and sub-skill across 3 difficulty tiers, with age-appropriate parameters for an 8-year-old.

## Requirements

### R1: Problem Types

The system MUST support exactly two problem types:

1. **Multiple-choice**: 4 answer options, one correct, with 3 plausible distractors
2. **Numeric input**: Free-form number entry with numeric-only validation

Every problem SHALL include: `question` (Spanish text), `correctAnswer` (number), `type` ("multiple-choice" | "numeric-input"), `skillId`, `subSkillId`, `tier` (1–3), and `options` (array of 4 numbers, only for multiple-choice).

#### Scenario: Multiple-choice rendering

- GIVEN a multiple-choice problem "7 × 8 = ?"
- WHEN the problem is rendered
- THEN exactly 4 answer buttons MUST be displayed
- AND exactly one MUST be correct (56)
- AND the 3 distractors MUST be distinct and plausible

#### Scenario: Numeric input rendering

- GIVEN a numeric-input problem "¿Cuántos lados tiene un hexágono?"
- WHEN the problem is rendered
- THEN a text input field MUST be displayed
- AND the input MUST accept only numeric characters (0–9)
- AND the accepted answer MUST be "6"

#### Scenario: Reordering avoids position bias

- GIVEN a multiple-choice problem
- WHEN options are rendered
- THEN the correct answer's position (1–4) SHOULD be randomized each time
- AND SHOULD NOT always be in the same position

### R2: Difficulty Tiers

Each sub-skill MUST define problems across 3 difficulty tiers. Tiers are defined per sub-skill domain.

#### Scenario: Multiplication tiers (sub-skill skill-05-01 "Tablas del 1 al 10")

- GIVEN sub-skill "Tablas del 1 al 10"
- WHEN generating a tier-1 problem
- THEN operands MUST be 2–5, products ≤ 25
- WHEN generating a tier-2 problem
- THEN operands MUST be 4–9, products ≤ 81
- WHEN generating a tier-3 problem
- THEN operands MAY be 6–10 with products up to 100
- AND MAY include missing-factor format (e.g., "6 × ? = 42")

#### Scenario: Division tiers (sub-skill skill-06-01 "Divisiones exactas")

- GIVEN sub-skill "Divisiones exactas (por 1 cifra)"
- WHEN generating a tier-1 problem
- THEN dividends ≤ 20, divisors 2–5, MUST be exact (remainder = 0)
- WHEN generating a tier-2 problem
- THEN dividends ≤ 50, divisors 2–9, MUST be exact
- WHEN generating a tier-3 problem
- THEN dividends ≤ 81, divisors 2–9, MUST be exact
- AND MAY include missing-divisor format ("36 ÷ ? = 4")

#### Scenario: Fractional scenarios for Práctica de la división

- GIVEN sub-skill "Divisiones con resto" (skill-07-01)
- WHEN generating a tier-1 problem
- THEN dividends ≤ 30, divisors 2–5, MUST have a remainder
- WHEN generating a tier-2 problem
- THEN dividends ≤ 60, divisors 2–9, MUST have a remainder
- WHEN generating a tier-3 problem
- THEN dividends ≤ 100, divisors 2–9, remainder present
- AND word problems that involve remainders

#### Scenario: Geometry tiers (sub-skill skill-08-01 "Clasificación de figuras")

- GIVEN sub-skill "Clasificación de figuras"
- WHEN generating a tier-1 problem
- THEN shapes MUST be basic: triangle, square, rectangle, circle
- WHEN generating a tier-2 problem
- THEN shapes MUST include: pentagon, hexagon, octagon
- AND properties: number of sides, number of angles
- WHEN generating a tier-3 problem
- THEN shapes MAY include: rhombus, trapezoid, parallelogram
- AND MAY combine classification with symmetry identification

#### Scenario: Measurement tiers (sub-skill skill-09-02 "Conversiones")

- GIVEN sub-skill "Conversiones entre unidades"
- WHEN generating a tier-1 problem
- THEN conversions MUST be within the same unit: m ↔ cm, cm ↔ mm
- AND numbers MUST be multiples of 10 (e.g., "3 m = ? cm" → 300)
- WHEN generating a tier-2 problem
- THEN conversions MAY cross between adjacent units
- AND numbers MAY be non-multiples of 10 (e.g., "5 m 30 cm = ? cm")
- WHEN generating a tier-3 problem
- THEN conversions MAY be multi-step (e.g., "2 m 5 cm = ? mm")
- AND SHOULD involve comparison (e.g., "¿Qué es mayor, 150 cm o 1 m 45 cm?")

#### Scenario: Time and money tiers (skill-11)

- GIVEN sub-skill "Lectura de reloj analógico/digital"
- WHEN generating a tier-1 problem
- THEN times MUST be on the hour or half-hour (e.g., 3:00, 5:30)
- WHEN generating a tier-2 problem
- THEN times MUST include quarter hours (e.g., 2:15, 7:45)
- WHEN generating a tier-3 problem
- THEN times MAY be any 5-minute interval (e.g., 4:23, 11:37)

- GIVEN sub-skill "Euros y céntimos"
- WHEN generating a tier-1 problem
- THEN amounts MUST be in whole euros (no cents)
- WHEN generating a tier-2 problem
- THEN amounts MUST include cents with .50 increments (e.g., €3.50)
- WHEN generating a tier-3 problem
- THEN amounts MAY include any cent value (e.g., €4.67)
- AND MAY involve calculating change

### R3: Distractor Generation

For multiple-choice problems, distractors MUST be computed algorithmically. They SHOULD reflect common error patterns for that specific sub-skill.

#### Scenario: Common-error distractors for multiplication facts

- GIVEN a problem "6 × 7 = ?" (correct: 42)
- WHEN computing distractors
- THEN they SHOULD include common errors:
  - "6 + 7 = 13" (operation confusion)
  - "6 × 7 − 1 = 41" (off-by-one)
  - "7 × 6 + 6 = 48" (skip-count overrun)
- AND at least 2 SHOULD be common-error patterns

#### Scenario: Distractor validation

- GIVEN a multiple-choice problem with 1 correct + 3 distractors
- WHEN all 4 values are generated
- THEN all values MUST be distinct
- AND values MUST be positive integers where applicable
- AND MUST fall within a plausible range for the sub-skill

#### Scenario: Distractor fallback

- GIVEN a sub-skill where common-error patterns cannot generate 3 distractors
- WHEN computing distractors
- THEN the system SHALL pad with correctAnswer ± random-offset distractors
- AND those MUST still be distinct from the correct answer

### R4: Procedural Problem Generation

Problems MUST be generated procedurally using parameterized templates. The system MAY use a seed based on session ID + problem index for reproducibility.

#### Scenario: Template-based generation

- GIVEN sub-skill "Divisiones exactas" has template "X ÷ Y = ?"
- WHEN a problem is requested at tier 2
- THEN the system MUST generate a valid division:
  - Pick a divisor Y (2–9)
  - Pick a quotient Q (1–10)
  - Compute dividend X = Y × Q (ensures exactness)
  - Present "X ÷ Y = ?"
  - Correct answer: Q

#### Scenario: Word problem variety

- GIVEN sub-skill "Problemas de multiplicación" at tier 1
- WHEN generating problems across 3 consecutive requests
- THEN each SHOULD use a different context (apples, stickers, toys, cookies, etc.)
- AND the same template SHOULD NOT repeat within 5 consecutive problems

#### Scenario: Template variety across sub-skills

- GIVEN a sub-skill has multiple templates (e.g., both "X × Y = ?" and "? × Y = Z")
- WHEN generating problems
- THEN the system SHOULD cycle through available templates
- AND SHOULD prefer the template least recently used within that session

### R5: Input Validation

For numeric input problems, the system MUST validate that the input is a number before evaluating correctness.

#### Scenario: Non-numeric input rejected

- GIVEN Ana types "doce" in a numeric input field
- WHEN the answer is submitted
- THEN the system MUST reject the input
- AND display "Solo números, por favor"
- AND allow Ana to retry on the same problem

#### Scenario: Leading zeros handled

- GIVEN Ana types "07" for a problem whose answer is 7
- WHEN the answer is submitted
- THEN the system MUST accept "07" as equivalent to 7

## Acceptance Criteria

- [ ] Two problem types implemented: multiple-choice (4 options) and numeric input
- [ ] 3 difficulty tiers per sub-skill with domain-appropriate parameters
- [ ] Distractors computed algorithmically, not hardcoded
- [ ] At least 2 of 3 distractors reflect common error patterns per sub-skill
- [ ] All 4 options are distinct and positive integers
- [ ] Problems generated procedurally from parameterized templates
- [ ] Word-problem contexts vary (no repeat within 5 of same template)
- [ ] Non-numeric input shows validation error without losing the problem
- [ ] Leading zeros accepted as equivalent to the numeric value
