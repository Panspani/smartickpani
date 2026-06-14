/**
 * VisualProblemView — Renders a visual problem with SVG scene + TTS narration.
 *
 * Flow:
 *   1. Scene animates in with SVG
 *   2. Story text fades in
 *   3. TTS narrates the story + question
 *   4. After narration, question + answer input appear
 *
 * @module components/VisualProblemView
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import type { VisualProblemData } from "../engine/scenes/types";
import GroupsScene from "./scenes/GroupsScene";
import ArrayScene from "./scenes/ArrayScene";
import NumberLineScene from "./scenes/NumberLineScene";
import ScaleScene from "./scenes/ScaleScene";
import FillScene from "./scenes/FillScene";
import ShopScene from "./scenes/ShopScene";
import GeometryScene from "./scenes/GeometryScene";
import { speak } from "../audio/tts";
import type { ProblemType } from "../engine/types";

export interface VisualProblemViewProps {
  problem: VisualProblemData;
  onAnswer: (answer: number) => void;
  disabled?: boolean;
  /** Type of problem (for rendering appropriate input) */
  problemType?: ProblemType;
}

const VisualProblemView: React.FC<VisualProblemViewProps> = ({
  problem,
  onAnswer,
  disabled = false,
  problemType,
}) => {
  const [phase, setPhase] = useState<"scene" | "story" | "question">("scene");
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [typedValue, setTypedValue] = useState("");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const safetyRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Narration orchestration ────────────────────
  //
  // NOTE: No narratedRef guard — React StrictMode double-invokes effects
  // in development. The cleanup function handles stale timeouts correctly.

  useEffect(() => {
    // Phase 1: Show scene (immediate)
    setPhase("scene");

    // Phase 2: After scene entrance animation, show story text + TTS
    const t = setTimeout(() => {
      setPhase("story");

      // Phase 3: Narrate via TTS, then show question
      // Chrome may block speechSynthesis.speak() without user gesture,
      // so we wrap in try-catch + fallback timeout.
      try {
        speak(problem.narration, 0.9, () => {
          setPhase("question");
        });
      } catch {
        // TTS unavailable — proceed to question immediately
        setPhase("question");
        return;
      }

      // Safety net: if TTS onend never fires (blocked, error, etc.),
      // show question after 6 seconds anyway
      safetyRef.current = setTimeout(() => {
        setPhase((p) => (p === "question" ? p : "question"));
      }, 6000);
    }, 800);
    timeoutRef.current = t;

    return () => {
      clearTimeout(timeoutRef.current!);
      if (safetyRef.current) clearTimeout(safetyRef.current);
    };
  }, [problem]);

  // ── Answer handlers ────────────────────────────

  const handleOptionClick = useCallback(
    (value: number) => {
      if (disabled || phase !== "question") return;
      setSelectedOption(value);
      // Brief delay so the user sees their selection
      setTimeout(() => onAnswer(value), 300);
    },
    [disabled, phase, onAnswer],
  );

  const handleTypedSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (disabled || phase !== "question" || typedValue.trim() === "") return;
      const val = parseInt(typedValue, 10);
      if (isNaN(val)) return;
      setTypedValue("");
      onAnswer(val);
    },
    [disabled, phase, typedValue, onAnswer],
  );

  // ── Render helpers ─────────────────────────────

  /** Render the scene SVG based on type. */
  const renderScene = () => {
    switch (problem.scene.type) {
      case "groups":
        return <GroupsScene scene={problem.scene} className="visual-problem__scene-svg" />;
      case "array":
        return <ArrayScene scene={problem.scene} className="visual-problem__scene-svg" />;
      case "number-line":
        return <NumberLineScene scene={problem.scene} className="visual-problem__scene-svg" />;
      case "scale":
        return <ScaleScene scene={problem.scene} className="visual-problem__scene-svg" />;
      case "fill":
        return <FillScene scene={problem.scene} className="visual-problem__scene-svg" />;
      case "shop":
        return <ShopScene scene={problem.scene} className="visual-problem__scene-svg" />;
      case "geometry-shape":
        return <GeometryScene scene={problem.scene} className="visual-problem__scene-svg" />;
      default:
        return <GroupsScene scene={problem.scene as any} className="visual-problem__scene-svg" />;
    }
  };

  /** Render answer options (multiple choice or numeric input). */
  const renderInput = () => {
    if (problem.options && problem.options.length > 0) {
      // Multiple choice
      const sorted = [...problem.options].sort((a, b) => a - b);
      return (
        <div className="visual-problem__options">
          {sorted.map((opt, i) => {
            const isSelected = selectedOption === opt;
            return (
              <button
                key={i}
                className={`visual-problem__option-btn ${
                  isSelected ? "visual-problem__option-btn--selected" : ""
                }`}
                onClick={() => handleOptionClick(opt)}
                disabled={disabled}
                type="button"
              >
                {opt}
              </button>
            );
          })}
        </div>
      );
    }

    // Numeric input
    return (
      <form className="visual-problem__input-form" onSubmit={handleTypedSubmit}>
        <input
          className="visual-problem__input"
          type="number"
          inputMode="numeric"
          pattern="[0-9]*"
          value={typedValue}
          onChange={(e) => setTypedValue(e.target.value)}
          placeholder="?"
          disabled={disabled}
          autoFocus
        />
        <button
          className="visual-problem__submit-btn"
          type="submit"
          disabled={disabled || typedValue.trim() === ""}
        >
          ✓
        </button>
      </form>
    );
  };

  return (
    <div className="visual-problem">
      {/* ── Scene area ──────────────────────────── */}
      <div className={`visual-problem__scene ${phase === "scene" ? "visual-problem__scene--visible" : ""}`}>
        {renderScene()}
      </div>

      {/* ── Story text ─────────────────────────── */}
      <div className={`visual-problem__story ${phase === "story" || phase === "question" ? "visual-problem__story--visible" : ""}`}>
        <p className="visual-problem__story-text">{problem.story}</p>
      </div>

      {/* ── Question + input ────────────────────── */}
      <div className={`visual-problem__question-area ${phase === "question" ? "visual-problem__question-area--visible" : ""}`}>
        <p className="visual-problem__question-text">{problem.question}</p>
        {renderInput()}
      </div>

      {/* ── Narration indicator + skip button ──── */}
      {phase === "story" && (
        <div className="visual-problem__listening">
          <span className="visual-problem__listening-icon">🔊</span>
          <span className="visual-problem__listening-text">Escuchá el problema...</span>
          <button
            className="visual-problem__skip-narration"
            onClick={() => setPhase("question")}
            type="button"
          >
            Saltar →
          </button>
        </div>
      )}
    </div>
  );
};

export default VisualProblemView;
