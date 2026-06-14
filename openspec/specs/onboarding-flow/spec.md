# Onboarding Flow Specification

## Purpose

Define a first-launch onboarding carousel that introduces the app's core concepts to new users across 3 screens, shown exactly once.

## Requirements

### R1: Launch Gate

The system MUST check `localStorage` on app load. If `smartick.onboardingDone` is `true`, the onboarding MUST be skipped and the app MUST render normally.

#### Scenario: First launch shows onboarding

- GIVEN Ana opens the app for the first time
- WHEN the app initializes
- THEN the system MUST check localStorage for `smartick.onboardingDone`
- AND if it is absent or `false`, the OnboardingCarousel MUST render instead of the app's main view

#### Scenario: Returning user skips onboarding

- GIVEN Ana has completed onboarding before
- WHEN the app initializes
- THEN `smartick.onboardingDone` MUST be `true`
- AND the app MUST render the main dashboard directly without showing onboarding

### R2: OnboardingCarousel — 3 Screens

The OnboardingCarousel MUST display exactly 3 full-screen slides that the child swipes through.

#### Scenario: Screen 1 — Welcome & Mascot

- GIVEN OnboardingCarousel renders
- WHEN the first screen is active
- THEN it MUST show: a friendly greeting ("¡Bienvenido a MateSmart!"), the Monster Mascot in `happy` state, and a brief description: "Aprende matemáticas con tu nuevo amigo"
- AND a "Siguiente →" button MUST be visible

#### Scenario: Screen 2 — How It Works

- GIVEN the user swipes to screen 2 (or taps "Siguiente")
- WHEN the second screen renders
- THEN it MUST explain the session flow: "Resuelve problemas, gana estrellas, consigue trofeos"
- AND show icons for: problem (➕), stars (⭐), and badge (🏆)
- AND a "Siguiente →" button MUST be visible

#### Scenario: Screen 3 — Get Started

- GIVEN the user swipes to screen 3 (or taps "Siguiente")
- WHEN the third screen renders
- THEN it MUST show a motivating message: "¿Listo para empezar?" with a large "¡Comenzar!" button
- AND the "Comenzar" button MUST be visually prominent (primary orange, large tap target)

### R3: Completion & Gate

The system MUST set `smartick.onboardingDone = "true"` when the user taps "¡Comenzar!" on screen 3.

#### Scenario: Gate persists after completion

- GIVEN Ana taps "¡Comenzar!" on screen 3
- WHEN the onboarding completes
- THEN `localStorage` MUST contain `smartick.onboardingDone` set to `"true"`
- AND the system MUST navigate to the child dashboard
- AND subsequent app loads MUST skip onboarding

#### Scenario: Gate survives refresh during onboarding

- GIVEN Ana is on screen 2 of onboarding
- WHEN the page is refreshed
- THEN onboarding MUST restart from screen 1
- AND `smartick.onboardingDone` MUST NOT be set until "¡Comenzar!" is tapped

### R4: Carousel Navigation

The carousel MUST support swiping (touch) and button-based navigation.

#### Scenario: Swipe to advance

- GIVEN Ana swipes left on any screen
- WHEN the swipe gesture ends
- THEN the carousel MUST advance to the next screen with a slide animation
- AND MUST NOT advance past screen 3

#### Scenario: Back navigation

- GIVEN Ana is on screen 2 or 3
- WHEN she taps a "← Anterior" button or swipes right
- THEN the carousel MUST go back one screen
- AND MUST NOT go before screen 1

## Acceptance Criteria

- [ ] Onboarding shows on first launch only
- [ ] `smartick.onboardingDone` gate prevents re-show
- [ ] 3 distinct screens covering welcome, how-it-works, and start
- [ ] Swipe and button navigation for all 3 screens
- [ ] "¡Comenzar!" persists the gate and navigates to dashboard
- [ ] Refresh during onboarding restarts from screen 1
