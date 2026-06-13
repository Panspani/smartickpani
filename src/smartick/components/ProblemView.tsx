/**
 * ProblemView — Problem dispatcher component.
 *
 * Receives a Problem from useSession and dispatches to the appropriate
 * sub-component based on problem.type:
 *   - 'multiple-choice' → MultipleChoice
 *   - 'numeric-input'  → NumericInput
 *
 * @module components/ProblemView
 */

import React, { useCallback } from "react";
import type { Problem } from "../engine/types";
import { PROBLEM_TYPES } from "../engine/types";
import MultipleChoice from "./MultipleChoice";
import NumericInput from "./NumericInput";

export interface ProblemViewProps {
  problem: Problem;
  onAnswer: (answer: number) => void;
  disabled?: boolean;
}

const ProblemView: React.FC<ProblemViewProps> = ({
  problem,
  onAnswer,
  disabled = false,
}) => {
  const handleAnswer = useCallback(
    (answer: number) => {
      onAnswer(answer);
    },
    [onAnswer],
  );

  return (
    <div className="smartick-problem-view">
      {/* Question text */}
      <p className="smartick-problem-view__question">{problem.text}</p>

      {/* Sub-skill context (small label) */}
      <span className="smartick-problem-view__subskill">
        {problem.subSkillId}
      </span>

      {/* Dispatch to matching input type */}
      <div className="smartick-problem-view__input-area">
        {problem.type === PROBLEM_TYPES.MULTIPLE_CHOICE ? (
          <MultipleChoice
            options={problem.options ?? []}
            correctAnswer={problem.answer}
            onAnswer={handleAnswer}
            disabled={disabled}
          />
        ) : (
          <NumericInput
            onAnswer={handleAnswer}
            disabled={disabled}
          />
        )}
      </div>
    </div>
  );
};

export default ProblemView;
