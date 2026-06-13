/**
 * ParentGate — Parent access challenge modal.
 *
 * Shows a modal with a random addition problem (numbers 3–20).
 * The user must solve it correctly to access the parent view.
 * Features:
 *   - Numeric input for the answer
 *   - Retry on wrong answer
 *   - Cancel / Escape to dismiss the modal
 *
 * @module components/ParentGate
 */

import React, { useState, useCallback, useEffect, useRef } from "react";

export interface ParentGateProps {
  /** First operand in the addition challenge. */
  a: number;
  /** Second operand in the addition challenge. */
  b: number;
  /** Called when the user answers correctly. */
  onCorrect: () => void;
  /** Called when the user cancels or presses Escape. */
  onCancel: () => void;
}

const ParentGate: React.FC<ParentGateProps> = ({
  a,
  b,
  onCorrect,
  onCancel,
}) => {
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      if (raw === "" || /^-?\d*$/.test(raw)) {
        setAnswer(raw);
        setError(false);
      }
    },
    [],
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const num = parseInt(answer, 10);
      if (isNaN(num)) return;

      if (num === a + b) {
        onCorrect();
      } else {
        setError(true);
        setAttempts((p) => p + 1);
        setAnswer("");
        inputRef.current?.focus();
      }
    },
    [answer, a, b, onCorrect],
  );

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onCancel();
      }
    },
    [onCancel],
  );

  return (
    <div
      className="smartick-parent-gate"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label="Verificación de padres"
    >
      <div className="smartick-parent-gate__modal">
        <h2 className="smartick-parent-gate__title">
          Acceso para padres
        </h2>

        <p className="smartick-parent-gate__instruction">
          Resolve esta cuenta para continuar:
        </p>

        <p className="smartick-parent-gate__challenge">
          {a} + {b} = ?
        </p>

        <form onSubmit={handleSubmit} className="smartick-parent-gate__form">
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            className={`smartick-parent-gate__input ${
              error ? "smartick-parent-gate__input--error" : ""
            }`}
            value={answer}
            onChange={handleChange}
            placeholder="Respuesta"
            aria-label="Escribí el resultado de la suma"
          />
          <button
            type="submit"
            className="smartick-parent-gate__submit"
            disabled={answer === ""}
          >
            Verificar
          </button>
        </form>

        {error && (
          <p className="smartick-parent-gate__error">
            Incorrecto. Intentos: {attempts}
          </p>
        )}

        <button
          type="button"
          className="smartick-parent-gate__cancel"
          onClick={onCancel}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};

export default ParentGate;
