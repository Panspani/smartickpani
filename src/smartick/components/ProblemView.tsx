/**
 * ProblemView — Problem dispatcher component.
 *
 * Receives a Problem from useSession and dispatches to the appropriate
 * sub-component based on problem.type:
 *   - 'multiple-choice' → MultipleChoice
 *   - 'numeric-input'  → NumericInput
 *
 * Visual data (if present) renders a display component above the question.
 *
 * @module components/ProblemView
 */

import React, { useCallback } from "react";
import type { Problem, VisualData } from "../engine/types";
import { PROBLEM_TYPES } from "../engine/types";
import MultipleChoice from "./MultipleChoice";
import NumericInput from "./NumericInput";
import ClockDisplay from "./ClockDisplay";
import ShapeDisplay from "./ShapeDisplay";
import SolidDisplay from "./SolidDisplay";
import BalanceDisplay from "./BalanceDisplay";
import ObjectGroupDisplay from "./ObjectGroupDisplay";
import CoinDisplay from "./CoinDisplay";
import MeasurementDisplay from "./MeasurementDisplay";

export interface ProblemViewProps {
  problem: Problem;
  onAnswer: (answer: number) => void;
  disabled?: boolean;
}

/** Render a visual display component based on visualData type. */
function renderVisualDisplay(vd: VisualData): React.ReactNode {
  switch (vd.type) {
    case "clock":
      return <ClockDisplay data={vd.data} />;
    case "shape":
      return <ShapeDisplay data={vd.data} />;
    case "solid":
      return <SolidDisplay data={vd.data} />;
    case "balance":
      return <BalanceDisplay data={vd.data} />;
    case "object-group":
      return <ObjectGroupDisplay data={vd.data} />;
    case "coins":
      return <CoinDisplay data={vd.data} />;
    case "measurement":
      return <MeasurementDisplay data={vd.data} />;
    default:
      return null;
  }
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
      {/* Visual display (if provided) */}
      {problem.visualData && renderVisualDisplay(problem.visualData)}

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
