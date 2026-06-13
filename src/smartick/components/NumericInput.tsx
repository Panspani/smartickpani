/**
 * NumericInput — Type-the-answer problem component.
 *
 * Features:
 *   - Large input field, restricted to numeric characters
 *   - "Solo números" validation with feedback
 *   - Leading-zero tolerant (012 accepted as 12)
 *   - Submit button
 *   - Inline feedback on correctness
 *
 * @module components/NumericInput
 */

import React, { useState, useCallback, useEffect, useRef } from "react";

export interface NumericInputProps {
  /** Callback fired when the user submits an answer. */
  onAnswer: (answer: number) => void;
  /** Externally disabled (e.g. feedback overlay active). */
  disabled?: boolean;
}

type FeedbackKind = "idle" | "correct" | "incorrect";

const NumericInput: React.FC<NumericInputProps> = ({
  onAnswer,
  disabled = false,
}) => {
  const [value, setValue] = useState("");
  const [feedback, setFeedback] = useState<FeedbackKind>("idle");
  const [validationError, setValidationError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Focus input on mount and on new problem (key change via parent)
  useEffect(() => {
    setValue("");
    setFeedback("idle");
    setValidationError(null);
    // Small delay to let the DOM settle
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => {
      clearTimeout(timer);
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current);
      }
    };
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;

      // Allow only digits, minus sign (for negative?), and empty
      if (raw === "" || /^-?\d*$/.test(raw)) {
        setValue(raw);
        setValidationError(null);
      } else {
        setValidationError("Solo números");
      }
    },
    [],
  );

  const handleSubmit = useCallback(() => {
    if (disabled || value === "" || feedback !== "idle") return;

    const numericValue = parseInt(value, 10);
    if (isNaN(numericValue)) {
      setValidationError("Escribí un número válido");
      return;
    }

    // Call onAnswer immediately
    onAnswer(numericValue);

    // The parent will set disabled=true via props when feedback is showing,
    // so we can briefly show inline feedback
    setFeedback("idle");
    setValue("");
  }, [disabled, value, feedback, onAnswer]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  const isInteractive = !disabled && feedback === "idle";

  return (
    <div className="smartick-numeric-input">
      <div className="smartick-numeric-input__field-group">
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          className={`smartick-numeric-input__field ${
            validationError ? "smartick-numeric-input__field--error" : ""
          }`}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={!isInteractive}
          placeholder="Escribí tu respuesta"
          aria-label="Escribí el número de tu respuesta"
        />
        <button
          className="smartick-numeric-input__submit"
          onClick={handleSubmit}
          disabled={!isInteractive || value === ""}
          type="button"
          aria-label="Enviar respuesta"
        >
          ✓
        </button>
      </div>

      {validationError && (
        <p className="smartick-numeric-input__validation">
          {validationError}
        </p>
      )}
    </div>
  );
};

export default NumericInput;
