import React from "react";
import type { CoinVisual } from "../engine/types";

interface CoinDisplayProps {
  data: CoinVisual;
}

/** Return coin radius and label based on centimo value */
function coinSpec(value: number): { radius: number; label: string; fill: string; stroke: string } {
  const goldFill = "#FDCB6E";
  const goldStroke = "#D4A843";
  const whiteFill = "#FFFFFF";

  if (value === 1) return { radius: 12, label: "1c", fill: goldFill, stroke: goldStroke };
  if (value === 2) return { radius: 12, label: "2c", fill: goldFill, stroke: goldStroke };
  if (value === 5) return { radius: 18, label: "5c", fill: goldFill, stroke: goldStroke };
  if (value === 10) return { radius: 18, label: "10c", fill: goldFill, stroke: goldStroke };
  if (value === 20) return { radius: 18, label: "20c", fill: goldFill, stroke: goldStroke };
  if (value === 50) return { radius: 24, label: "50c", fill: goldFill, stroke: goldStroke };
  if (value === 100) return { radius: 24, label: "1€", fill: whiteFill, stroke: goldStroke };
  if (value === 200) return { radius: 24, label: "2€", fill: whiteFill, stroke: goldStroke };
  return { radius: 18, label: `${value}c`, fill: goldFill, stroke: goldStroke };
}

const CoinDisplay: React.FC<CoinDisplayProps> = ({ data }) => {
  const { coins, totalCentimos } = data;

  const coinGap = 8;
  const rowGap = 10;
  const maxRowWidth = 200;
  const paddingX = 10;
  const paddingY = 10;

  // Layout coins in rows
  const rows: Array<Array<{ value: number; spec: ReturnType<typeof coinSpec> }>> = [];
  let currentRow: Array<{ value: number; spec: ReturnType<typeof coinSpec> }> = [];
  let currentWidth = 0;

  for (const coin of coins) {
    for (let c = 0; c < coin.count; c++) {
      const spec = coinSpec(coin.value);
      const diam = spec.radius * 2;
      const neededWidth = currentWidth === 0 ? diam : currentWidth + coinGap + diam;

      if (currentWidth > 0 && neededWidth > maxRowWidth) {
        rows.push(currentRow);
        currentRow = [];
        currentWidth = 0;
      }

      currentRow.push({ value: coin.value, spec });
      currentWidth += currentWidth === 0 ? diam : coinGap + diam;
    }
  }
  if (currentRow.length > 0) rows.push(currentRow);

  const totalHeight = rows.length > 0
    ? rows.length * (24 * 2) + (rows.length - 1) * rowGap + paddingY * 2 + 30
    : 80;

  const coinElements: React.ReactNode[] = [];

  rows.forEach((row, ri) => {
    const rowY = paddingY + ri * (24 * 2 + rowGap) + 24;
    const rowTotalWidth = row.reduce((w, c) => w + (w === 0 ? 0 : coinGap) + c.spec.radius * 2, 0);
    // Account for coinGap: the first coin has no leading gap
    const firstCoinOffset = row.length > 0 ? row[0].spec.radius : 0;
    const startX = (maxRowWidth - rowTotalWidth + firstCoinOffset) / 2 + paddingX;

    let cx = startX;
    row.forEach((coin, ci) => {
      const { radius, label, fill, stroke } = coin.spec;

      coinElements.push(
        <g key={`${ri}-${ci}`}>
          {/* Coin circle */}
          <circle cx={cx} cy={rowY} r={radius} fill={fill} stroke={stroke} strokeWidth="2.5" />
          {/* Inner ring for large outline coins (1€, 2€) */}
          {coin.value >= 100 && (
            <circle cx={cx} cy={rowY} r={radius - 5} fill="none" stroke={stroke} strokeWidth="1.5" opacity="0.5" />
          )}
          {/* Label */}
          <text
            x={cx}
            y={rowY}
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily='"Baloo 2", sans-serif'
            fontSize={radius <= 12 ? "9" : "12"}
            fontWeight="700"
            fill={coin.value >= 100 ? "var(--smartick-primary)" : "#2D3436"}
          >
            {label}
          </text>
        </g>
      );

      // Advance to next position
      const nextCoin = ci + 1 < row.length ? row[ci + 1] : null;
      if (nextCoin) {
        cx += radius + coinGap + nextCoin.spec.radius;
      }
    });
  });

  return (
    <div className="smartick-visual-coins">
      <svg
        viewBox={`0 0 ${maxRowWidth + paddingX * 2} ${totalHeight}`}
        width={maxRowWidth + paddingX * 2}
        height={totalHeight}
        style={{ maxWidth: "100%" }}
      >
        {coinElements}

        {/* Total label */}
        <text
          x={maxRowWidth / 2 + paddingX}
          y={totalHeight - 8}
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily='"Baloo 2", sans-serif'
          fontSize="14"
          fontWeight="700"
          fill="var(--smartick-primary)"
        >
          Total: {totalCentimos} céntimos
        </text>
      </svg>
    </div>
  );
};

export default CoinDisplay;
