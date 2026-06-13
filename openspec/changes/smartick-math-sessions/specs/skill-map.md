# Skill Map Specification

## Purpose

Define the 8 math skills (3rd grade, Unidad 5–12) with exact sub-skill breakdowns, mastery thresholds, and progression rules that drive session adaptation for Ana (8yo).

## Requirements

### R1: Skill Structure

The system MUST define exactly 8 top-level skills. Each skill MUST contain 3–5 sub-skills representing distinct cognitive operations.

#### Scenario: All 8 skills present

- GIVEN the curriculum defines Unidad 5 through Unidad 12
- WHEN the system loads the skill map
- THEN exactly 8 skills exist with IDs `skill-05` through `skill-12`
- AND each skill name matches the curriculum unit title in Spanish

#### Scenario: Skills have required fields

- GIVEN a loaded skill map
- WHEN inspecting any skill entry
- THEN it MUST contain `id`, `name` (Spanish), `unidad` (number 5–12), `trimestre` (2 or 3), `subSkills` array, `masteryPercentage`, and `skillMastered` boolean

### R2: Exact Sub-Skill Breakdown

Each skill's sub-skills MUST match the breakdown below exactly. Sub-skill IDs follow the pattern `{skillId}-{index}`.

#### Scenario: Unidad 5 — Práctica de la multiplicación (Trimestre 2)

- GIVEN skill-05 "Práctica de la multiplicación"
- WHEN inspecting its sub-skills
- THEN exactly 4 sub-skills MUST exist:
  - `skill-05-01` "Tablas del 1 al 10"
  - `skill-05-02` "Multiplicaciones por 1 cifra"
  - `skill-05-03` "Multiplicaciones por 2 cifras"
  - `skill-05-04` "Problemas de multiplicación"

#### Scenario: Unidad 6 — La división (Trimestre 2)

- GIVEN skill-06 "La división"
- WHEN inspecting its sub-skills
- THEN exactly 3 sub-skills MUST exist:
  - `skill-06-01` "Divisiones exactas (por 1 cifra)"
  - `skill-06-02` "Relación multiplicación-división"
  - `skill-06-03` "Problemas de división"

#### Scenario: Unidad 7 — Práctica de la división (Trimestre 2)

- GIVEN skill-07 "Práctica de la división"
- WHEN inspecting its sub-skills
- THEN exactly 3 sub-skills MUST exist:
  - `skill-07-01` "Divisiones con resto"
  - `skill-07-02` "Divisiones por 2 cifras"
  - `skill-07-03` "Problemas con división"

#### Scenario: Unidad 8 — Las figuras planas (Trimestre 2)

- GIVEN skill-08 "Las figuras planas"
- WHEN inspecting its sub-skills
- THEN exactly 3 sub-skills MUST exist:
  - `skill-08-01` "Clasificación de figuras"
  - `skill-08-02` "Perímetro"
  - `skill-08-03` "Simetría"

#### Scenario: Unidad 9 — Medidas de longitud (Trimestre 3)

- GIVEN skill-09 "Medidas de longitud"
- WHEN inspecting its sub-skills
- THEN exactly 3 sub-skills MUST exist:
  - `skill-09-01` "m, cm, mm"
  - `skill-09-02` "Conversiones entre unidades"
  - `skill-09-03` "Estimación y medición"

#### Scenario: Unidad 10 — La capacidad y la masa (Trimestre 3)

- GIVEN skill-10 "La capacidad y la masa"
- WHEN inspecting its sub-skills
- THEN exactly 4 sub-skills MUST exist:
  - `skill-10-01` "l, ml (capacidad)"
  - `skill-10-02` "g, kg (masa)"
  - `skill-10-03` "Conversiones"
  - `skill-10-04` "Problemas de capacidad y masa"

#### Scenario: Unidad 11 — El tiempo y el dinero (Trimestre 3)

- GIVEN skill-11 "El tiempo y el dinero"
- WHEN inspecting its sub-skills
- THEN exactly 4 sub-skills MUST exist:
  - `skill-11-01` "Lectura de reloj analógico/digital"
  - `skill-11-02` "Horas, minutos"
  - `skill-11-03` "Euros y céntimos"
  - `skill-11-04` "Problemas con dinero"

#### Scenario: Unidad 12 — Los cuerpos geométricos (Trimestre 3)

- GIVEN skill-12 "Los cuerpos geométricos"
- WHEN inspecting its sub-skills
- THEN exactly 3 sub-skills MUST exist:
  - `skill-12-01` "Prismas y pirámides"
  - `skill-12-02` "Cilindros, conos, esferas"
  - `skill-12-03` "Aristas, vértices, caras"

### R3: Mastery Thresholds

The system MUST track mastery at both sub-skill and skill level using accuracy and response time.

#### Scenario: Sub-skill mastery criteria

- GIVEN the mastery evaluation runs for a sub-skill
- WHEN the learner has ≥80% accuracy across the last 10 attempts
- AND average response time ≤30 seconds
- THEN the sub-skill SHALL be marked as `mastered: true`
- OTHERWISE the sub-skill SHALL remain unmastered

#### Scenario: Skill-level mastery criteria

- GIVEN a skill with N sub-skills
- WHEN ≥70% of its sub-skills are mastered (ceil(N × 0.7))
- THEN the skill SHALL be marked as `skillMastered: true`
- OTHERWISE the skill SHALL remain unmastered

#### Scenario: Partial data handling

- GIVEN a sub-skill has fewer than 10 total attempts
- WHEN the system evaluates mastery
- THEN mastery SHALL be computed from available data
- BUT the system SHOULD consider the sub-skill not yet reliable (confidence low)

### R4: Progression Rules

Skills MUST unlock sequentially based on prior skill mastery to guide Ana through a structured learning path.

#### Scenario: Sequential unlock within Trimestre 2

- GIVEN skill-05 has <40% sub-skill mastery
- WHEN the system determines available skills
- THEN only skill-05 is available
- AND skill-06, skill-07, skill-08 MUST be locked

#### Scenario: Next skill unlocks at 40% threshold

- GIVEN skill-05 reaches ≥40% sub-skill mastery
- WHEN the system refreshes available skills
- THEN skill-06 SHALL become unlocked
- BUT skill-07 MUST remain locked until skill-06 reaches ≥40%

#### Scenario: Cross-trimester gate (Trimestre 2 → Trimestre 3)

- GIVEN fewer than 3 skills in Trimestre 2 (skill-05 through skill-08) have ≥60% mastery
- WHEN determining available skills
- THEN all Trimestre 3 skills (skill-09 through skill-12) MUST remain locked

#### Scenario: Trimestre 3 unlocked

- GIVEN at least 3 of skill-05, skill-06, skill-07, skill-08 have ≥60% mastery
- WHEN determining available skills
- THEN skill-09 SHALL become available
- AND the same 40% sequential gate applies within Trimestre 3

#### Scenario: Locked skills excluded from sessions

- GIVEN a skill is locked per progression rules
- WHEN the adaptive session engine requests the candidate skill pool
- THEN the locked skill MUST NOT appear in the pool
- AND MUST NOT be selected for any problem

### R5: Trimestre Assignment

- Trimestre 2: skill-05 through skill-08
- Trimestre 3: skill-09 through skill-12

## Acceptance Criteria

- [ ] Skill map defines exactly 8 skills with IDs skill-05 through skill-12
- [ ] Each skill has sub-skills matching the exact Spanish names from R2
- [ ] Sub-skill mastered when ≥80% accuracy across last 10 attempts AND ≤30s avg response time
- [ ] Skill mastered when ≥70% sub-skills mastered
- [ ] Skills unlock sequentially within trimester at 40% threshold
- [ ] Cross-trimester gate requires ≥3 skills at ≥60% mastery
- [ ] Locked skills never appear in session problem selection
