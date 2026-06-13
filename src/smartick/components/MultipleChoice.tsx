/**
 * MultipleChoice — 4-option problem component.
 *
 * Renders a 2×2 grid of buttons with the available options.
 * Features:
 *   - Random option position (the correct answer is placed among distractors)
 *   - Disabled after selection
 *   - Highlight selected: correct (green), incorrect (red)
 *   - Auto-advance: calls onAnswer immediately, local visual feedback for 1.5s
 *
 * @module components/MultipleChoice
 */

import React, { useState, useCallback, useRef, useEffect } from "react";

export interface MultipleChoiceProps {
  /** The four option values to display. */
  options: number[];
  /** The correct answer. */
  correctAnswer: number;
  /** Callback fired immediately when the user makes a selection. */
  onAnswer: (answer: number) => void;
  /** Externally disabled (e.g. feedback overlay active). */
  disabled?: boolean;
}

type AnswerState =
  | { status: "idle" }
  | { status: "answered"; selected: number; isCorrect: boolean };

const MultipleChoice: React.FC<MultipleChoiceProps> = ({
  options,
  correctAnswer,
  onAnswer,
  disabled = false,
}) => {
  const [answerState, setAnswerState] = useState<AnswerState>({
    status: "idle",
  });
  const autoAdvanceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset state when options change (new problem)
  useEffect(() => {
    setAnswerState({ status: "idle" });
    return () => {
      if (autoAdvanceRef.current) {
        clearTimeout(autoAdvanceRef.current);
      }
    };
  }, [options, correctAnswer]);

  const handleSelect = useCallback(
    (value: number) => {
      if (answerState.status !== "idle" || disabled) return;

      const isCorrect = value === correctAnswer;
      setAnswerState({ status: "answered", selected: value, isCorrect });

      // Fire answer immediately
      onAnswer(value);

      // Auto-clear visual state after 1.5s
      autoAdvanceRef.current = setTimeout(() => {
        setAnswerState({ status: "idle" });
        autoAdvanceRef.current = null;
      }, 1500);
    },
    [answerState.status, disabled, correctAnswer, onAnswer],
  );

  const isInteractive = answerState.status === "idle" && !disabled;

  return (
    <div className="smartick-multiple-choice" role="group" aria-label="Opciones de respuesta">
      <div className="smartick-multiple-choice__grid">
        {options.map((value, index) => {
          let className = "smartick-multiple-choice__option";

          if (answerState.status === "answered") {
            if (value === correctAnswer) {
              className += " smartick-multiple-choice__option--correct";
            } else if (value === answerState.selected) {
              className += " smartick-multiple-choice__option--incorrect";
            }
          }

          return (
            <button
              key={`${value}-${index}`}
              className={className}
              onClick={() => handleSelect(value)}
              disabled={!isInteractive}
              type="button"
              aria-label={`Opción ${index + 1}: ${value}`}
            >
              {value}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MultipleChoice;
