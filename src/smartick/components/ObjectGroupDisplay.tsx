import React from "react";
import type { ObjectGroupVisual } from "../engine/types";

interface ObjectGroupDisplayProps {
  data: ObjectGroupVisual;
}

const ObjectGroupDisplay: React.FC<ObjectGroupDisplayProps> = ({
  data,
}) => {
  const { groups, perGroup, icon, highlightIndex } = data;

  const cellSize = 44;
  const gap = 8;
  const paddingX = 16;
  const paddingY = 16;
  const colWidth = cellSize + gap;

  const svgWidth = Math.max(perGroup * colWidth + paddingX * 2 - gap, 120);
  const svgHeight = groups * (cellSize + gap) + paddingY * 2 - gap;

  const rows: React.ReactNode[] = [];

  for (let row = 0; row < groups; row++) {
    const rowY = paddingY + row * (cellSize + gap);

    // Highlight background for this row
    if (highlightIndex !== undefined && row === highlightIndex) {
      rows.push(
        <rect
          key={`bg-${row}`}
          x={paddingX - 4}
          y={rowY - 2}
          width={svgWidth - paddingX * 2 + 8}
          height={cellSize + 4}
          rx="10"
          fill="rgba(108, 92, 231, 0.08)"
        />
      );
    }

    for (let col = 0; col < perGroup; col++) {
      const x = paddingX + col * colWidth + cellSize / 2;
      const y = rowY + cellSize / 2;

      rows.push(
        <text
          key={`${row}-${col}`}
          x={x}
          y={y}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="26"
        >
          {icon}
        </text>
      );
    }
  }

  return (
    <div className="smartick-visual-object-group">
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        width={svgWidth}
        height={svgHeight}
        style={{ maxWidth: "100%" }}
      >
        {rows}
      </svg>
    </div>
  );
};

export default ObjectGroupDisplay;
