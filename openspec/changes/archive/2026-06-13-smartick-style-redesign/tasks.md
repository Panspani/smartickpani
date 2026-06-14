# Tasks: Smartick-Style Redesign

## Delivery Strategy

- **Chain strategy**: `feature-branch-chain` — 3 PRs, each building on the previous
- Base branch: `main`
- Feature branch: `feature/smartick-style`
- PR #1 → PR #2 → PR #3 → merge to `feature/smartick-style` → `main`
- Cada PR debe pasar `npm run build` sin errores y no romper funcionalidad existente

---

## PR #1 — Identidad Visual + Audio (~400 líneas)

**Branch target**: `feature/smartick-style` (desde `main`)
**Propósito**: Migrar paleta de colores, tema aventura, mini-confetti, mute button, y mejorar audio

---

### T1.1: Migrar variables CSS a paleta naranja

| Campo | Valor |
|---|---|
| **Archivos a modificar** | `src/smartick/styles/smartick.css` |
| **Dependencias** | Ninguna |
| **Estimación** | ~80 líneas |

**Descripción**: Cambiar todas las variables CSS de paleta púrpura a naranja (#FF6B35 primary). Actualizar backgrounds, shadows, gradients, y colores hardcodeados que referencien #6C5CE7.

**Variables a modificar**:
- `--smartick-primary`: `#6C5CE7` → `#FF6B35`
- `--smartick-primary-dark`: `#5A4BD1` → `#E55A2B`
- `--smartick-primary-light`: `#A29BFE` → `#FF9F6E`
- `--smartick-secondary`: `#FD79A8` → `#FF8C42` (opcional, mantener rosa si funciona)
- `--smartick-bg`: `#F8F9FF` → `#FFF8F0`
- `--smartick-ring-bg`: `#E8E8FF` → `#FFF0E0`
- `--smartick-ring-star`: `#6C5CE7` → `#FF6B35`
- `--smartick-confetti-1`: `#6C5CE7` → `#FF6B35`
- `--smartick-shadow-*`: cambiar `rgba(108, 92, 231, ...)` → `rgba(255, 107, 53, ...)`

**Gradients y backgrounds con purple hardcodeado** (reemplazar por variables):
- `.smartick-start-screen` background: reemplazar `#7C6CF0` por variante naranja
- `.smartick-feedback-overlay--streak`: `rgba(108, 92, 231, 0.9)` → variable
- `.smartick-feedback-overlay--milestone`: gradient con purple → variable
- `.smartick-session-screen` background: `#F0EEFF` → `#FFF0E0`
- `.smartick-dashboard` background: `#F0EEFF` → `#FFF0E0`
- `.smartick-results-screen` background: `#EDE8FF` → `#FFF0E0`

**Criterios de aceptación**:
- [ ] `--smartick-primary` es `#FF6B35` en todo el CSS
- [ ] No queda ningún `#6C5CE7` en el CSS (verificar con grep)
- [ ] Todos los shadows usan el nuevo valor alfa
- [ ] StartScreen, dashboard, session, results se ven con la nueva paleta
- [ ] Componentes de problema (MultipleChoice, NumericInput) usan el nuevo primary en focus/active states

---

### T1.2: Actualizar ClockDisplay.tsx — colores hardcodeados

| Campo | Valor |
|---|---|
| **Archivos a modificar** | `src/smartick/components/ClockDisplay.tsx` |
| **Dependencias** | T1.1 (requiere variables CSS actualizadas) |
| **Estimación** | ~20 líneas |

**Descripción**: Reemplazar referencias hardcodeadas a `#6C5CE7` por `var(--smartick-primary)` en el SVG del reloj.

**Cambios específicos**:
- Línea 44: `stroke="#6C5CE7"` → `stroke="var(--smartick-primary)"` (ticks de hora)
- Línea 109: `stroke="#6C5CE7"` → `stroke="var(--smartick-primary)"` (minute hand)
- Línea 115: `fill="#6C5CE7"` → `fill="var(--smartick-primary)"` (center cap)
- Línea 82: `stroke="#A29BFE"` → `stroke="var(--smartick-primary-light)"` (clock face border)
- Línea 83: `strokeWidth="4"` (sin cambios)

**Criterios de aceptación**:
- [ ] ClockDisplay usa `var(--smartick-primary)` y `var(--smartick-primary-light)` en vez de valores hardcodeados
- [ ] ClockDisplay se ve correctamente con la paleta naranja
- [ ] No hay referencias a `#6C5CE7` en ClockDisplay.tsx

---

### T1.3: Agregar tema aventura (decoraciones SVG, iconos, textos)

| Campo | Valor |
|---|---|
| **Archivos a modificar** | `src/smartick/styles/smartick.css`, `src/smartick/components/ChildDashboard.tsx` |
| **Archivos a crear** | Ninguno (decoraciones inline CSS/SVG) |
| **Dependencias** | T1.1 |
| **Estimación** | ~100 líneas |

**Descripción**: Agregar decoraciones SVG de fondo con temática aventura/pirata en el dashboard y session screen. Aplicar textos temáticos adventure.

**En smartick.css**:
- Agregar pseudo-elementos decorativos SVG (background/edge) en `.smartick-dashboard`:
  - Compás, mapa del tesoro, olas, timón de barco (SVG inline en `::before`/`::after` o elementos CSS)
- Nuevos keyframes para animaciones de decoraciones flotantes (reutilizar `smartick-float` o crear variantes)
- Decoraciones NO deben solaparse con skill rings ni botones
- Clases para los iconos temáticos (treasure star, flame torch, treasure chest, X-marks-the-spot)

**En ChildDashboard.tsx**:
- Agregar elementos decorativos SVG alrededor del dashboard (no interactivos, position absolute)
- Aplicar themed labels condicionalmente:
  - "Racha del tesoro" (antes "Racha")
  - "Monedas de oro" (antes "Estrellas")
  - "Misión cumplida" (antes "Sesión completada")
- Mantener labels originales como fallback

**Criterios de aceptación**:
- [ ] Decoraciones SVG se renderizan en el dashboard sin solapar contenido
- [ ] Decoraciones NO son interactivas (pointer-events: none)
- [ ] Textos temáticos aparecen donde corresponde
- [ ] No hay regresión en el layout del dashboard
- [ ] `npm run build` pasa sin errores

---

### T1.4: Mini-confetti en FeedbackOverlay correct

| Campo | Valor |
|---|---|
| **Archivos a crear** | `src/smartick/components/MiniConfetti.tsx` |
| **Archivos a modificar** | `src/smartick/components/FeedbackOverlay.tsx`, `src/smartick/styles/smartick.css` |
| **Dependencias** | T1.1 (para colores de confetti) |
| **Estimación** | ~50 líneas |

**Descripción**: Crear componente MiniConfetti que muestra ≤20 partículas, ≤1s duración. Se dispara solo cuando FeedbackOverlay muestra type='correct'.

**MiniConfetti.tsx**:
- Props: `{ play: boolean }` — cuando `true`, renderiza partículas
- ≤20 partículas con posiciones/delays aleatorios
- Reutiliza keyframe `smartick-confetti` existente, pero con duración más corta (≤1s)
- Posicionado absolutamente dentro del overlay
- `aria-hidden="true"` — decorativo no semántico

**En smartick.css**:
- Nueva clase `.smartick-mini-confetti` con partículas más pequeñas (4-6px)
- Animación más rápida (0.8-1s en vez de 3.5s)

**En FeedbackOverlay.tsx**:
- Importar MiniConfetti
- Renderizar `<MiniConfetti play={type === 'correct'} />` dentro del overlay

**Criterios de aceptación**:
- [ ] Confetti aparece solo cuando type === 'correct'
- [ ] ≤20 partículas, duración ≤1s
- [ ] No bloquea la transición al siguiente problema
- [ ] Sin confetti en type 'incorrect', 'streak', o 'milestone'

---

### T1.5: Botón mute en top bar de SessionScreen

| Campo | Valor |
|---|---|
| **Archivos a crear** | `src/smartick/components/MuteButton.tsx` |
| **Archivos a modificar** | `src/smartick/components/SessionScreen.tsx` |
| **Dependencias** | Ninguna (usa useAudio que ya existe) |
| **Estimación** | ~40 líneas |

**Descripción**: Botón de mute/unmute en la top bar de SessionScreen. Usa `useAudio().isMuted` y `toggleMute`.

**MuteButton.tsx**:
- Props: `{ isMuted: boolean; onToggle: () => void }`
- SVG speaker icon con dos paths (speaker on / speaker off)
- Tooltip o aria-label: "Silenciar" / "Activar sonido"
- Tamaño compacto para caber en la top bar (~36×36px)
- `-webkit-tap-highlight-color: transparent`

**En SessionScreen.tsx**:
- Importar `useAudio` hook y `MuteButton`
- En la top bar, agregar MuteButton junto a TimerDisplay (lado izquierdo o derecho)
- Wires: `const audio = useAudio()` → pasar `isMuted` + `toggleMute`

**Consideraciones**: No necesita prop drilling — useAudio es un hook que puede llamarse directamente dentro de SessionScreen. El estado de mute ya persiste en localStorage via `smartick.settings.audioEnabled`.

**Criterios de aceptación**:
- [ ] Botón mute visible en la top bar de SessionScreen
- [ ] Icono cambia entre speaker on/off según estado
- [ ] Toggle persiste en `smartick.settings.audioEnabled`
- [ ] Audio se silencia/activa inmediatamente al tocar

---

### T1.6: Mejorar audio (samples base64)

| Campo | Valor |
|---|---|
| **Archivos a modificar** | `src/smartick/audio/sounds.ts` |
| **Dependencias** | Ninguna (cambios internos, API pública igual) |
| **Estimación** | ~80 líneas |

**Descripción**: Reemplazar síntesis programática (Web Audio API `OscillatorNode`) por reproducción de samples Base64-encoded WAV. Mantener la misma API pública (`playCorrect`, `playIncorrect`, `playMilestone`, `playStreak`, `playSessionEnd`, `setMuted`, `isMuted`).

**Cambios internos**:
- Reemplazar `tone()` helper por `decodeBase64Sample()` + `playSample()`
- Pre-encodear 5 samples WAV (8 kHz, 8-bit mono, ≤400ms cada uno) como strings Base64
- Cache de `AudioBuffer` en un Map: primer `ensureAudio()` decodifica todos
- Cada `play*()` crea `BufferSourceNode` + `start()`
- Misma lazy-init, misma lógica de mute gate

**Generación de samples**: Usar herramienta externa (sox, ffmpeg, Tone.js offline render, o generador online) para crear WAVs equivalentes a los sonidos actuales:
1. correct: C5→E5 rising chime (≤200ms)
2. incorrect: G3 low triangle tone (≤300ms)
3. milestone: C5→E5→G5 fanfare (≤400ms)
4. streak: C5→D5→E5→G5 rising (≤350ms)
5. session-end: C5→E5→G5→C6 fanfare (≤600ms)

**Optimización**: Total < 50 KB en bundle. Samples pueden cargarse lazy (no decodificar hasta primer play).

**Criterios de aceptación**:
- [ ] `playCorrect()` reproduce un sonido de timbre ascendente (no silencio ni error)
- [ ] `playIncorrect()` reproduce tono grave suave
- [ ] `playMilestone()` reproduce fanfarria de 3 tonos
- [ ] `playStreak()` reproduce secuencia ascendente de 4 tonos
- [ ] `playSessionEnd()` reproduce fanfarria completa
- [ ] Mute state funciona igual (no reproduce si muted)
- [ ] `npm run build` sin errores
- [ ] Bundle incremento < 50 KB

---

## PR #2 — Mascota + Interactividad (~350 líneas)

**Branch target**: PR #1 branch (`feature/smartick-style` con PR #1 mergeado)
**Propósito**: Monster mascot animado, ClockDisplay interactivo, OnboardingCarousel

---

### T2.1: Crear MonsterDisplay.tsx (SVG, 5 estados, animaciones)

| Campo | Valor |
|---|---|
| **Archivos a crear** | `src/smartick/components/MonsterDisplay.tsx` |
| **Archivos a modificar** | `src/smartick/styles/smartick.css` (keyframes para mascota) |
| **Dependencias** | Ninguna |
| **Estimación** | ~100 líneas |

**Descripción**: Componente de mascota monstruo con 5 estados SVG inline y animaciones CSS. Contenedor de tamaño fijo para evitar layout shift.

**MonsterDisplay.tsx**:
- Props: `{ state: 'idle' | 'happy' | 'sad' | 'thinking' | 'celebration' }`
- 5 inline SVGs (cada uno ≤5 KB, zero network):
  - `idle`: parado, ojos abiertos, sonrisa suave — animación bob/breathing
  - `happy`: saltando, sonrisa grande, brazos arriba — animación bounce
  - `sad`: orejas caídas, ojos tristes pero dulces — animación droop
  - `thinking`: mano en mentón, ojos mirando arriba — animación head-scratch
  - `celebration`: saltando, brazos arriba, estrellitas — animación jump
- Contenedor fixed: `80×100px`, `position: absolute`, `z-index: 50`
- Timer de auto-return: cada estado no-idle vuelve a `idle` tras 2-3s
- Estado inicial: `idle`

**En smartick.css**:
- `@keyframes monster-bob`: idle breathing (translateY ±3px, 2s)
- `@keyframes monster-bounce`: happy (scale 1.1→1, 0.4s)
- `@keyframes monster-droop`: sad (translateY +5px, 0.5s)
- `@keyframes monster-think`: thinking (translateY -2px, 1.5s)
- `@keyframes monster-jump`: celebration (translateY -10px, 0.3s)

**Criterios de aceptación**:
- [ ] 5 estados renderizan SVGs distintos
- [ ] Cada SVG es inline (no `<img>`, no fetch) y < 5 KB
- [ ] Contenedor 80×100px no cambia tamaño entre estados (no layout shift)
- [ ] Auto-return a idle funciona con setTimeout/useEffect cleanup
- [ ] Animaciones son suaves (CSS, no JS-driven)

---

### T2.2: Integrar mascota en SessionScreen

| Campo | Valor |
|---|---|
| **Archivos a modificar** | `src/smartick/components/SessionScreen.tsx` |
| **Dependencias** | T2.1 |
| **Estimación** | ~25 líneas |

**Descripción**: Agregar MonsterDisplay en SessionScreen, visible durante los problemas. Estado basado en el feedback y streak.

**Cambios**:
- Importar `MonsterDisplay` y `useState`
- Estado local: `monsterState: 'idle' | 'happy' | 'sad' | 'thinking' | 'celebration'`
- Al montar un nuevo problema (sin feedback): `monsterState = 'thinking'` (3s → idle)
- Al recibir feedback correct: `monsterState = 'happy'` (2s → idle)
- Al recibir feedback incorrect: `monsterState = 'sad'` (2s → idle)
- Cuando streak ≥ 5: `monsterState = 'celebration'` (3s → idle)
- Renderizar `<MonsterDisplay state={monsterState} />` en el problem area (esquina inferior derecha)

**Criterios de aceptación**:
- [ ] MonsterDisplay visible en SessionScreen durante problemas
- [ ] Estado cambia según correct/incorrect/streak
- [ ] Posicionado sin cubrir el problema
- [ ] No hay regresión en el flujo de sesión

---

### T2.3: Integrar mascota en FeedbackOverlay

| Campo | Valor |
|---|---|
| **Archivos a modificar** | `src/smartick/components/FeedbackOverlay.tsx` |
| **Dependencias** | T2.1 |
| **Estimación** | ~20 líneas |

**Descripción**: Agregar MonsterDisplay dentro del overlay de feedback, reaccionando al tipo de respuesta.

**Cambios**:
- Importar `MonsterDisplay`
- Añadir prop opcional `type` (ya existe en FeedbackOverlayProps)
- Renderizar `<MonsterDisplay state={monsterState} />` dentro del overlay content
- Estado según type:
  - `'correct'` → `'happy'`
  - `'incorrect'` → `'sad'`
  - `'streak'` → `'celebration'`
  - `'milestone'` → `'celebration'`

**Criterios de aceptación**:
- [ ] MonsterDisplay visible dentro del overlay
- [ ] Estado correcto según type de feedback
- [ ] No rompe el layout del mensaje

---

### T2.4: Integrar mascota en ResultsScreen

| Campo | Valor |
|---|---|
| **Archivos a modificar** | `src/smartick/components/ResultsScreen.tsx` |
| **Dependencias** | T2.1 |
| **Estimación** | ~25 líneas |

**Descripción**: Agregar MonsterDisplay en ResultsScreen en estado celebration al mostrar resultados.

**Cambios**:
- Importar `MonsterDisplay` y `useState`
- Estado local: `monsterState` inicializado como `'celebration'`
- Timer: 3s celebration → idle
- Renderizar al lado del session summary (junto al título o sobre las estrellas)

**Criterios de aceptación**:
- [ ] MonsterDisplay visible en pantalla de resultados
- [ ] Empieza en 'celebration', pasa a 'idle' tras 3s
- [ ] No obstruye estrellas, stats, o botón Volver

---

### T2.5: Hacer ClockDisplay interactivo (tap para cambiar hora)

| Campo | Valor |
|---|---|
| **Archivos a modificar** | `src/smartick/components/ClockDisplay.tsx` |
| **Dependencias** | T1.2 |
| **Estimación** | ~50 líneas |

**Descripción**: Agregar modo interactivo al reloj — el niño puede tocar para cambiar la hora y validar. La prop `interactive` activa el modo, y `onHourSelect` callback notifica al padre.

**Cambios**:
- Nueva prop `interactive?: boolean` (default `false`)
- Nueva prop `onHourSelect?: (selectedHour: number) => void`
- Cuando `interactive` es `true`:
  - El reloj es clickeable/tappable
  - Tap en la esfera cicla la hora 1→12 (o área de números)
  - La manilla horaria se mueve en tiempo real con transición CSS
  - La hora seleccionada se muestra con highlight visual
- El padre (ProblemView) compara la hora seleccionada con `ClockVisual.hour`
- Mantener modo no-interactivo intacto (current behavior)

**Implementación**:
- `useState<number>(1)` para hora seleccionada (solo en interactive mode)
- `onClick` handler en el SVG que avanza la hora
- Transición CSS `transition: transform 0.3s ease` en la manilla

**Criterios de aceptación**:
- [ ] Modo no-interactivo funciona exactamente como antes
- [ ] Modo interactivo: tap cambia la hora, manilla se actualiza
- [ ] `onHourSelect` se dispara con la hora seleccionada
- [ ] No hay regresión en problemas de reloj existentes

---

### T2.6: Crear OnboardingCarousel (3 pantallas, localStorage gate)

| Campo | Valor |
|---|---|
| **Archivos a crear** | `src/smartick/components/OnboardingCarousel.tsx` |
| **Archivos a modificar** | `src/smartick/components/SmartickApp.tsx`, `src/smartick/styles/smartick.css` |
| **Dependencias** | T2.1 (usa MonsterDisplay en screen 1) |
| **Estimación** | ~120 líneas |

**Descripción**: Carrusel de onboarding de 3 pantallas que se muestra solo en el primer launch. Gate de localStorage.

**OnboardingCarousel.tsx**:
- Props: `{ onComplete: () => void }`
- 3 pantallas full-screen con slide animation:
  1. **Bienvenida**: "¡Bienvenido a MateSmart!" + MonsterDisplay estado `happy` + "Aprende matemáticas con tu nuevo amigo" + "Siguiente →"
  2. **Cómo funciona**: "Resuelve problemas, gana estrellas, consigue trofeos" + iconos (➕⭐🏆) + "Siguiente →"
  3. **¿Listo?**: "¿Listo para empezar?" + botón grande "¡Comenzar!" (naranja, prominent)
- Navegación: swipe touch (≥50px threshold) + botones "Siguiente →" y "← Anterior"
- Transición: slide horizontal CSS (transform: translateX)
- Al tocar "¡Comenzar!" en screen 3:
  1. `localStorage.setItem('smartick.onboardingDone', 'true')`
  2. Llama a `onComplete()`

**En SmartickApp.tsx**:
- Al inicio, check `localStorage.getItem('smartick.onboardingDone')`
- Si no existe o es `false`, renderizar `<OnboardingCarousel onComplete={goToHome} />` en lugar del router normal
- Si existe, render normal

**En smartick.css**:
- `.smartick-onboarding` — full-screen container
- `.smartick-onboarding__slide` — slide con transición
- `.smartick-onboarding__dots` — indicadores de página
- `.smartick-onboarding__button` — botones de navegación

**Criterios de aceptación**:
- [ ] Onboarding se muestra en primer launch (sin localStorage key)
- [ ] 3 pantallas con contenido correcto
- [ ] Swipe y botones funcionan para avanzar/retroceder
- [ ] "¡Comenzar!" persiste gate y navega al dashboard
- [ ] Segundo load skips onboarding
- [ ] Refresh durante onboarding reinicia desde screen 1
- [ ] Gate no se setea hasta "¡Comenzar!" en screen 3

---

## PR #3 — Minijuegos Post-Sesión (~400+ líneas)

**Branch target**: PR #2 branch (con PR #1 y PR #2 mergeados)
**Propósito**: Memory minigame, transiciones post-sesión, recompensas, celebraciones

---

### T3.1: Crear MiniGameScreen con juego Memory (grilla 4×3/4×4)

| Campo | Valor |
|---|---|
| **Archivos a crear** | `src/smartick/components/MiniGameScreen.tsx` |
| **Archivos a modificar** | `src/smartick/styles/smartick.css` |
| **Dependencias** | Ninguna |
| **Estimación** | ~180 líneas |

**Descripción**: Pantalla de minijuego Memory con grilla de cartas, lógica de flip/match/mismatch, responsive.

**MiniGameScreen.tsx**:
- Props: `{ onWin: (starsToAdd: number) => void; onSkip: () => void }`
- **Game initialization**:
  - 8 pares (16 cartas) para 4×4, 6 pares (12 cartas) para 4×3
  - Valores: número + cantidad de puntos (ej: "5" + "•••••") o formas geométricas
  - Shuffle aleatorio con Fisher-Yates
- **Card flip**:
  - Tap en carta boca abajo → flip con `rotateY(180deg)` 400ms CSS
  - Revela valor
  - Máximo 2 cartas volteadas a la vez
- **Match logic**:
  - Si coinciden → quedan boca arriba, glow verde, disabled
  - Si no coinciden → 1s delay, flip back
  - Contador de movimientos
- **Win condition**:
  - Todos los pares encontrados → `onWin(2)` y celebración
- **Responsive**: `@media (max-width: 360px)` → 4×3 grid (12 cards, 6 pairs)

**En smartick.css**:
- `.smartick-minigame` — container full-screen
- `.smartick-minigame__grid` — grid 4 columnas, gap 0.5rem
- `.smartick-minigame__card` — perspectiva 3D, `transform-style: preserve-3d`
- `.smartick-minigame__card-inner` — rotación Y 180deg en flipeada
- `.smartick-minigame__card--matched` — glow verde
- `.smartick-minigame__card--mismatch` — shake rojo breve
- `@keyframes card-glow` — pulso verde en match
- `@keyframes card-shake` — shake rápido en mismatch
- Grid responsive: `@media (max-width: 360px)` → 3 columnas

**Criterios de aceptación**:
- [ ] Grilla 4×4 con 16 cartas boca abajo al inicio
- [ ] Tap voltea carta con animación 400ms
- [ ] Match: cartas quedan boca arriba con glow
- [ ] Mismatch: cartas vuelven tras 1s
- [ ] Win detection correcta (todos los pares)
- [ ] Responsive 4×3 en ≤360px viewport

---

### T3.2: Agregar transición SessionScreen → MiniGameScreen → dashboard

| Campo | Valor |
|---|---|
| **Archivos a modificar** | `src/smartick/components/SmartickApp.tsx`, `src/smartick/components/ResultsScreen.tsx`, `src/smartick/engine/types.ts` |
| **Dependencias** | T3.1 |
| **Estimación** | ~80 líneas |

**Descripción**: Agregar vista MINIGAME al router, transición desde ResultsScreen con prompt "¿Jugar?", y navegación a dashboard al terminar/saltear.

**En engine/types.ts**:
- Agregar `MINIGAME: "minigame"` a `VIEWS`
- Actualizar type `View` (se infiere automáticamente)

**En SmartickApp.tsx**:
- Agregar `MINIGAME` a `AppState` (similar a `sessionResultId`)
- Nuevo action type: `"START_MINIGAME"` y `"MINIGAME_COMPLETE"`
- En `renderView()`: caso `VIEWS.MINIGAME` → `<MiniGameScreen onWin={...} onSkip={...} />`
- `onWin`: suma +2 estrellas al session result, navega a HOME
- `onSkip`: navega a HOME sin cambios

**En ResultsScreen.tsx**:
- Agregar prop `onPlayGame?: () => void` (opcional)
- Debajo del botón "Volver", agregar prompt "¿Jugar un juego?" con:
  - Botón "¡Sí!" → llama `onPlayGame()`
  - Botón "Volver al inicio" → llama `onGoHome()`
- El prompt NO bloquea acceso a resultados

**Criterios de aceptación**:
- [ ] ResultsScreen muestra "¿Jugar un juego?" con dos botones
- [ ] "¡Sí!" navega a MiniGameScreen
- [ ] "Volver al inicio" navega al dashboard
- [ ] Al ganar minijuego, vuelve al dashboard
- [ ] Al saltear minijuego, vuelve al dashboard sin cambios
- [ ] VIEWS incluye MINIGAME

---

### T3.3: Lógica de recompensa (+2 estrellas por ganar)

| Campo | Valor |
|---|---|
| **Archivos a modificar** | `src/smartick/components/MiniGameScreen.tsx`, `src/smartick/components/SmartickApp.tsx` |
| **Dependencias** | T3.1, T3.2 |
| **Estimación** | ~40 líneas |

**Descripción**: Implementar lógica de recompensa: +2 estrellas al ganar el memory game, 0 al saltear/perder.

**En MiniGameScreen.tsx**:
- Al ganar (win condition): llamar `onWin(2)` con 2 estrellas
- Mostrar "¡Ganaste! +2 ⭐" con animación bounce-in
- Botón "Volver al inicio" después de la celebración

**En SmartickApp.tsx**:
- `handleMinigameWin(starsToAdd)`: 
  - Buscar el session result actual
  - Sumar starsToAdd al total de estrellas
  - Persistir cambio en storage
- `handleMinigameSkip()`: navegar a HOME sin cambios

**Consideración**: Las estrellas del minijuego son adicionales a las de la sesión. Se suman al total del session result para que persistan en el dashboard.

**Criterios de aceptación**:
- [ ] Ganar memory game suma exactamente 2 estrellas
- [ ] Skip minigame suma 0 estrellas
- [ ] Estrellas persisten al volver al dashboard
- [ ] StarCounter muestra el total actualizado

---

### T3.4: Animaciones de celebración en minijuego

| Campo | Valor |
|---|---|
| **Archivos a modificar** | `src/smartick/components/MiniGameScreen.tsx`, `src/smartick/styles/smartick.css` |
| **Dependencias** | T3.1, T2.1 (MonsterDisplay opcional), T1.1 (colores confetti) |
| **Estimación** | ~50 líneas |

**Descripción**: Animaciones de celebración al ganar el minijuego: confetti, MonsterDisplay celebration, banner bounce-in.

**En MiniGameScreen.tsx**:
- Al detectar win:
  1. Confetti burst (≤30 partículas, ≤2s) — puede reutilizar MiniConfetti o crear lógica inline
  2. Display "¡Ganaste! +2 ⭐" con animación bounce-in centrada
  3. Si MonsterDisplay está disponible (import opcional), mostrar estado 'celebration'
  4. Botón "Volver al inicio" aparece tras la animación (delay 1.5s)

**En smartick.css**:
- `.smartick-minigame__win-banner` — banner centrado con bounce-in
- `@keyframes banner-bounce` — escala 0→1.15→1 con overshoot
- Confetti: ≤30 partículas, colores primarios + variantes, duración ≤2s

**Criterios de aceptación**:
- [ ] Confetti ≤30 partículas, ≤2s, no bloquea UI
- [ ] "¡Ganaste!" banner animado con bounce-in
- [ ] +2 ⭐ se muestra junto al banner
- [ ] Botón "Volver al inicio" aparece después de la animación

---

## Review Workload Forecast

| Métrica | Valor |
|---|---|
| **Total líneas estimadas** | ~880 (PR #1: ~370 + PR #2: ~340 + PR #3: ~370) |
| **Riesgo superar 400-línea por PR** | **Bajo** — cada PR está dentro del target. PR #3 es el más ajustado (370 vs 400), pero el diseño modular mantiene los cambios acotados |
| **Recomendación** | ✅ **Chained PRs** — la estrategia actual es correcta. Cada PR es revisable independientemente, no hay dependencias circulares, y el feature branch accumulativo permite merge gradual |
| **Necesita decisión antes de apply** | **Sí** — dos items requieren decisión externa antes de comenzar implementación: (1) Generar los Base64 WAV samples para sounds.ts — necesita herramienta externa (sox, ffmpeg, o generador online); (2) Art direction de MonsterDisplay SVG — estilo cute vs. abstracto, definición visual de los 5 estados |

### Riesgos por PR

| PR | Riesgo | Mitigación |
|---|---|---|
| **PR #1** | Bajo — cambios mayormente en CSS y aditivos (nuevos componentes pequeños) | CSS variables permiten rollback instantáneo; nuevo MuteButton y MiniConfetti no rompen existing |
| **PR #2** | Medio — MonsterDisplay es componente nuevo con ciclo de vida (timers de auto-return); OnboardingCarousel toca el root component | UseEffect cleanup riguroso; onboarding gate en localStorage, fácil de debuggear |
| **PR #3** | Medio — Nueva vista MINIGAME toca el router (types.ts + SmartickApp.tsx); memory game tiene lógica de estado no trivial | Separar lógica de juego del render; tests unitarios para match/mismatch/win |

### Recomendación de orden de review

1. **PR #1 primero**: cambios visuales base — reviewers verifican consistencia cromática y audio
2. **PR #2 después**: mascota e interactividad — reviewers verifican comportamiento de estados y onboarding
3. **PR #3 al final**: minijuego — reviewers verifican flujo completo session→minigame→dashboard
