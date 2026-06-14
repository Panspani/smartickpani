/**
 * OnboardingCarousel — First-launch walkthrough (3 slides).
 *
 * Shows exactly once: checks localStorage `smartick.onboardingDone`.
 * 3 full-screen slides with swipe + button navigation.
 * Slide 3 "¡Comenzar!" persists the gate and calls onComplete.
 *
 * @module components/OnboardingCarousel
 */

import React, { useState, useCallback, useRef, useEffect } from "react";
import MonsterDisplay from "./MonsterDisplay";

export interface OnboardingCarouselProps {
  onComplete: () => void;
}

const SLIDES = [
  {
    title: "¡Bienvenido a MateSmart!",
    text: "Aprendé matemáticas con tu nuevo amigo. Solo 15 minutos por día.",
  },
  {
    title: "Resolvé problemas",
    text: "Elegí la respuesta correcta, escribí el número, o mové el reloj. ¡Ganá estrellas por cada acierto!",
  },
  {
    title: "¿Listo para empezar?",
    text: "Acumulá estrellas, armá rachas y desbloqueá medallas. ¡Cada sesión es una nueva aventura!",
  },
];

/** Minimum swipe distance in px to trigger navigation. */
const SWIPE_THRESHOLD = 50;

const OnboardingCarousel: React.FC<OnboardingCarouselProps> = ({
  onComplete,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchDelta, setTouchDelta] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // ── Navigation helpers ─────────────────────────

  const goNext = useCallback(() => {
    setCurrentSlide((prev) => Math.min(prev + 1, SLIDES.length - 1));
  }, []);

  const goPrev = useCallback(() => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  }, []);

  const handleComplete = useCallback(() => {
    localStorage.setItem("smartick.onboardingDone", "true");
    onComplete();
  }, [onComplete]);

  // ── Touch handlers ─────────────────────────────

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      setTouchStart(e.touches[0].clientX);
      setTouchDelta(0);
    },
    [],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (touchStart === null) return;
      const delta = e.touches[0].clientX - touchStart;
      setTouchDelta(delta);
    },
    [touchStart],
  );

  const handleTouchEnd = useCallback(() => {
    if (touchStart === null) return;

    if (touchDelta < -SWIPE_THRESHOLD && currentSlide < SLIDES.length - 1) {
      goNext();
    } else if (touchDelta > SWIPE_THRESHOLD && currentSlide > 0) {
      goPrev();
    }

    setTouchStart(null);
    setTouchDelta(0);
  }, [touchStart, touchDelta, currentSlide, goNext, goPrev]);

  // ── Keyboard nav ───────────────────────────────

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") goNext();
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") goPrev();
      if (e.key === "Enter" && currentSlide === SLIDES.length - 1)
        handleComplete();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goNext, goPrev, currentSlide, handleComplete]);

  const isFirst = currentSlide === 0;
  const isLast = currentSlide === SLIDES.length - 1;

  // Slide offset for transform
  const slideOffset = -currentSlide * 100;

  return (
    <div className="smartick-onboarding">
      {/* Slides */}
      <div
        className="smartick-onboarding__slides-wrapper"
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateX(${slideOffset + (touchStart !== null ? touchDelta / 4 : 0)}%)`,
        }}
      >
        {/* Slide 1: Welcome */}
        <div className="smartick-onboarding__slide">
          <div className="smartick-onboarding__mascot-area">
            <MonsterDisplay state="happy" size="large" />
          </div>
          <h1 className="smartick-onboarding__title">{SLIDES[0].title}</h1>
          <p className="smartick-onboarding__text">{SLIDES[0].text}</p>
        </div>

        {/* Slide 2: How it works */}
        <div className="smartick-onboarding__slide">
          <div className="smartick-onboarding__mascot-area">
            <MonsterDisplay state="thinking" size="large" />
          </div>
          <h1 className="smartick-onboarding__title">{SLIDES[1].title}</h1>
          <p className="smartick-onboarding__text">{SLIDES[1].text}</p>
          <div className="smartick-onboarding__icons">
            <div>
              <div>➕</div>
              <div className="smartick-onboarding__icon-label">Problemas</div>
            </div>
            <div>
              <div>⭐</div>
              <div className="smartick-onboarding__icon-label">Estrellas</div>
            </div>
            <div>
              <div>🏆</div>
              <div className="smartick-onboarding__icon-label">Trofeos</div>
            </div>
          </div>
        </div>

        {/* Slide 3: Ready */}
        <div className="smartick-onboarding__slide">
          <div className="smartick-onboarding__mascot-area">
            <MonsterDisplay state="happy" size="large" />
          </div>
          <h1 className="smartick-onboarding__title">{SLIDES[2].title}</h1>
          <p className="smartick-onboarding__text">{SLIDES[2].text}</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="smartick-onboarding__nav">
        {/* Back button (hidden on first slide) */}
        {!isFirst && (
          <button
            className="smartick-onboarding__button smartick-onboarding__button--back"
            onClick={goPrev}
            type="button"
          >
            ← Anterior
          </button>
        )}

        {/* Dots indicator */}
        <div className="smartick-onboarding__dots">
          {SLIDES.map((_, i) => (
            <span
              key={i}
              className={`smartick-onboarding__dot ${
                i === currentSlide ? "smartick-onboarding__dot--active" : ""
              }`}
              onClick={() => setCurrentSlide(i)}
              role="button"
              tabIndex={0}
              aria-label={`Ir a pantalla ${i + 1}`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") setCurrentSlide(i);
              }}
            />
          ))}
        </div>

        {/* Next / Start button */}
        {isLast ? (
          <button
            className="smartick-onboarding__button smartick-onboarding__button--start"
            onClick={handleComplete}
            type="button"
          >
            ¡Comenzar!
          </button>
        ) : (
          <button
            className="smartick-onboarding__button"
            onClick={goNext}
            type="button"
          >
            Siguiente →
          </button>
        )}
      </div>
    </div>
  );
};

export default OnboardingCarousel;
