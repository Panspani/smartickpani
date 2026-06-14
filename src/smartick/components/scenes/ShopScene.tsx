/**
 * ShopScene — CLAYMORPHISM PRO SVG shop/payment scene.
 *
 * Soft 3D items with price tags, chunky coins, playful pastels.
 *
 * @module components/scenes/ShopScene
 */

import React, { useMemo } from "react";
import type { ShopScene as ShopSceneType } from "../../engine/scenes/types";
import { SCENE_ICONS, ICON_GRADIENTS } from "./SceneIcons";

interface ShopSceneProps {
  scene: ShopSceneType;
  className?: string;
}

const SVG_W = 400;
const SVG_H = 270;

const ShopScene: React.FC<ShopSceneProps> = ({ scene, className }) => {
  const visibleItems = useMemo(
    () => scene.items.slice(0, 4).map((it, i) => ({
      ...it,
      iconName: ["apple", "cookie", "book", "candy", "star", "flower", "ball", "pencil"][i % 8],
      x: 55 + i * 85,
      y: 90,
      delay: 0.12 + i * 0.1,
    })),
    [scene.items],
  );

  const coins = useMemo(
    () => scene.payment.map((_, i) => ({
      x: 35 + i * 28,
      y: 200,
      delay: 0.5 + i * 0.08,
    })),
    [scene.payment],
  );

  const totalPrice = scene.items.reduce((s, it) => s + it.price, 0);

  return (
    <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className={className}
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "auto", maxWidth: "420px", display: "block" }}
      preserveAspectRatio="xMidYMid meet"
    >
      {ICON_GRADIENTS}
      <defs>
        <filter id="sh-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="3" dy="4" stdDeviation="4" floodColor="rgba(0,0,0,0.08)" />
        </filter>
        <filter id="sh-coin-s" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="2" dy="2" stdDeviation="2" floodColor="rgba(0,0,0,0.1)" />
        </filter>
        <style>{`
          @keyframes sh-in {
            0% { transform: scale(0) translateY(12px); opacity: 0; }
            60% { transform: scale(1.05) translateY(-2px); opacity: 1; }
            100% { transform: scale(1) translateY(0); opacity: 1; }
          }
          @keyframes sh-coin {
            0% { transform: scale(0) rotate(-90deg); opacity: 0; }
            60% { transform: scale(1.1) rotate(10deg); opacity: 1; }
            100% { transform: scale(1) rotate(0deg); opacity: 1; }
          }
          .sh-in { animation: sh-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
          .sh-coin { animation: sh-coin 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
        `}</style>
      </defs>

      <rect width={SVG_W} height={SVG_H} fill="transparent" />
      <circle cx="60" cy="50" r="35" fill="rgba(253,203,110,0.04)" />
      <circle cx="340" cy="60" r="40" fill="rgba(79,70,229,0.03)" />

      {/* Counter line */}
      <line x1="20" y1="165" x2="380" y2="165" stroke="rgba(49,46,129,0.06)" strokeWidth="2" strokeDasharray="6,4" />

      {/* Items */}
      {visibleItems.map((item, i) => {
        const Icon = SCENE_ICONS[item.iconName] || SCENE_ICONS.apple;
        return (
          <g key={i} className="sh-in" style={{ animationDelay: `${item.delay}s` }}>
            {/* Card */}
            <rect x={item.x - 28} y={item.y - 28} width="56" height="56" rx="14"
              fill="rgba(255,255,255,0.08)" stroke="rgba(49,46,129,0.1)" strokeWidth="2.5"
              filter="url(#sh-shadow)" />
            <rect x={item.x - 24} y={item.y - 24} width="48" height="24" rx="8"
              fill="rgba(255,255,255,0.06)" />
            {/* Icon */}
            <g transform={`translate(${item.x - 12}, ${item.y - 10})`}>
              <Icon size={24} />
            </g>
            {/* Price tag */}
            <rect x={item.x - 22} y={item.y + 32} width="44" height="20" rx="10"
              fill="rgba(255,107,53,0.1)" stroke="rgba(255,107,53,0.2)" strokeWidth="2" />
            <text x={item.x} y={item.y + 46} textAnchor="middle" fontSize="11" fontWeight="800"
              fill="#FF6B35" fontFamily="'Baloo 2', system-ui, sans-serif">
              {item.price}€
            </text>
          </g>
        );
      })}

      {/* Payment area */}
      <text x="20" y="194" fontSize="12" fontWeight="700"
        fill="rgba(49,46,129,0.3)" fontFamily="'Baloo 2', system-ui, sans-serif">
        Pago:
      </text>

      {/* Coins */}
      {coins.map((coin, i) => (
        <g key={i} className="sh-coin" style={{ animationDelay: `${coin.delay}s}` }}>
          <circle cx={coin.x} cy={coin.y} r="12"
            fill="#FDCB6E" stroke="#E8B54E" strokeWidth="2.5" filter="url(#sh-coin-s)" />
          <circle cx={coin.x - 2} cy={coin.y - 2} r="5" fill="rgba(255,255,255,0.15)" />
          <text x={coin.x} y={coin.y + 1} textAnchor="middle" dominantBaseline="central"
            fontSize="9" fontWeight="800" fill="#B8860B" fontFamily="system-ui, sans-serif">€</text>
        </g>
      ))}

      {/* Total */}
      <text x={SVG_W / 2} y={SVG_H - 20} textAnchor="middle" fontSize="14" fontWeight="800"
        fill="rgba(49,46,129,0.35)" fontFamily="'Baloo 2', system-ui, sans-serif">
        Total: {totalPrice}€
      </text>
    </svg>
  );
};

export default ShopScene;
