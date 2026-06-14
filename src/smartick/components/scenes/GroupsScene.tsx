/**
 * GroupsScene — CLAYMORPHISM PRO SVG visualization.
 *
 * Soft 3D, chunky elements, toy-like aesthetic, double shadows,
 * thick borders (3-4px), rounded corners (16-24px), pastel colors,
 * smooth bouncy animations for children's educational context.
 *
 * @module components/scenes/GroupsScene
 */

import React, { useMemo } from "react";
import type { GroupsScene as GroupsSceneType } from "../../engine/scenes/types";
import { SCENE_ICONS, ICON_GRADIENTS } from "./SceneIcons";

interface GroupsSceneProps {
  scene: GroupsSceneType;
  className?: string;
}

const SVG_W = 400;
const SVG_H = 290;
const GROUP_W = 110;
const GROUP_H = 150;
const ITEM_SIZE = 26;
const MAX_ITEMS_PER_ROW = 3;
const GROUP_GAP = 22;
const RADIUS = 18;

// Claymorphism color palette (pastel + vibrant)
const GROUP_STYLES = [
  { fill: "#FDBCB4", border: "#E8A89E", shadow: "rgba(200,140,130,0.4)", innerLight: "rgba(255,255,255,0.35)", innerDark: "rgba(200,100,90,0.1)", glow: "#FF6B35" },
  { fill: "#ADD8E6", border: "#8BB8CC", shadow: "rgba(120,160,180,0.4)", innerLight: "rgba(255,255,255,0.35)", innerDark: "rgba(100,150,170,0.1)", glow: "#74B9FF" },
  { fill: "#98FF98", border: "#78D88A", shadow: "rgba(100,190,120,0.4)", innerLight: "rgba(255,255,255,0.35)", innerDark: "rgba(80,170,100,0.1)", glow: "#00B894" },
  { fill: "#E6E6FA", border: "#C8C8E0", shadow: "rgba(160,160,200,0.4)", innerLight: "rgba(255,255,255,0.35)", innerDark: "rgba(140,140,180,0.1)", glow: "#A29BFE" },
  { fill: "#FFEAA7", border: "#E8D08A", shadow: "rgba(200,180,100,0.4)", innerLight: "rgba(255,255,255,0.35)", innerDark: "rgba(180,160,80,0.1)", glow: "#FDCB6E" },
  { fill: "#FFD0D0", border: "#E8B0B0", shadow: "rgba(200,140,140,0.4)", innerLight: "rgba(255,255,255,0.35)", innerDark: "rgba(180,100,100,0.1)", glow: "#FF7675" },
];

const ICON_NAMES = ["ball", "apple", "cookie", "star", "flower", "candy"];

interface Position {
  x: number; y: number; delay: number; index: number;
}

interface GroupLayout {
  x: number; y: number; style: typeof GROUP_STYLES[number];
  itemPositions: Position[]; iconName: string;
}

function calculateLayout(scene: GroupsSceneType): GroupLayout[] {
  const { groups: groupCount, perGroup } = scene;
  const totalWidth = groupCount * GROUP_W + (groupCount - 1) * GROUP_GAP;
  const startX = Math.max(20, (SVG_W - totalWidth) / 2);
  const groupY = 55;

  const layouts: GroupLayout[] = [];
  for (let g = 0; g < Math.min(groupCount, 6); g++) {
    const gx = startX + g * (GROUP_W + GROUP_GAP);
    const style = GROUP_STYLES[g % GROUP_STYLES.length];
    const iconName = ICON_NAMES[g % ICON_NAMES.length];

    const itemPositions: Position[] = [];
    const cols = Math.min(perGroup, MAX_ITEMS_PER_ROW);
    const rows = Math.ceil(perGroup / cols);
    const itemGap = 8;
    const gridW = cols * (ITEM_SIZE + itemGap) - itemGap;
    const gridH = rows * (ITEM_SIZE + itemGap) - itemGap;
    const ox = (GROUP_W - gridW) / 2;
    const oy = (GROUP_H - gridH) / 2;

    for (let i = 0; i < perGroup; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;
      itemPositions.push({
        x: gx + ox + col * (ITEM_SIZE + itemGap) + ITEM_SIZE / 2,
        y: groupY + oy + row * (ITEM_SIZE + itemGap) + ITEM_SIZE / 2,
        delay: 0.12 + g * 0.1 + i * 0.04,
        index: i,
      });
    }
    layouts.push({ x: gx, y: groupY, style, itemPositions, iconName });
  }
  return layouts;
}

const GroupsScene: React.FC<GroupsSceneProps> = ({ scene, className }) => {
  const layout = useMemo(() => calculateLayout(scene), [scene]);

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "auto", maxWidth: "420px", display: "block" }}
      preserveAspectRatio="xMidYMid meet"
    >
      {ICON_GRADIENTS}

      <defs>
        {/* Claymorphism double shadow */}
        <filter id="c-shadow" x="-30%" y="-30%" width="160%" height="170%">
          <feDropShadow dx="4" dy="6" stdDeviation="6" floodColor="rgba(0,0,0,0.1)" />
        </filter>
        <filter id="c-inner" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="-2" dy="-2" stdDeviation="4" floodColor="rgba(255,255,255,0.2)" />
        </filter>
        <style>{`
          @keyframes c-group-in {
            0% { transform: scale(0.85); opacity: 0; }
            60% { transform: scale(1.04); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
          }
          @keyframes c-item-in {
            0% { transform: scale(0) rotate(30deg); opacity: 0; }
            50% { transform: scale(1.2) rotate(-6deg); opacity: 1; }
            100% { transform: scale(1) rotate(0deg); opacity: 1; }
          }
          @keyframes c-float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-3px); }
          }
          .c-group { animation: c-group-in 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
          .c-item { animation: c-item-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
          .c-float { animation: c-float 3s ease-in-out infinite; }
        `}</style>
      </defs>

      {/* Background ambient blobs */}
      <circle cx="60" cy="50" r="55" fill="rgba(79,70,229,0.03)" />
      <circle cx="340" cy="240" r="60" fill="rgba(130,200,255,0.03)" />
      <circle cx="200" cy="20" r="35" fill="rgba(255,107,53,0.03)" />

      {/* Floating decorative dots */}
      {[[30, 100, 3, 0], [370, 70, 2.5, 0.5], [380, 210, 3.5, 1], [20, 230, 2, 1.5]].map(([x, y, r, d], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill="rgba(79,70,229,0.08)" className="c-float" style={{ animationDelay: `${d}s` }} />
      ))}

      {/* Groups */}
      {layout.map((group, gi) => {
        const Icon = SCENE_ICONS[group.iconName] || SCENE_ICONS.ball;
        return (
          <g key={gi} className="c-group" style={{ animationDelay: `${gi * 0.1}s` }}>
            {/* Outer shadow (claymorphism) */}
            <rect
              x={group.x + 4} y={group.y + 6}
              width={GROUP_W} height={GROUP_H}
              rx={RADIUS} ry={RADIUS}
              fill={group.style.shadow}
              opacity="0.5"
            />

            {/* Main box body */}
            <rect
              x={group.x} y={group.y}
              width={GROUP_W} height={GROUP_H}
              rx={RADIUS} ry={RADIUS}
              fill={group.style.fill}
              stroke={group.style.border}
              strokeWidth="3.5"
            />

            {/* Inner highlight (top-left glow) */}
            <rect
              x={group.x + 4} y={group.y + 4}
              width={GROUP_W - 8} height={GROUP_H * 0.4}
              rx={RADIUS - 4} ry={RADIUS - 4}
              fill={group.style.innerLight}
            />

            {/* Inner shadow (bottom-right) */}
            <rect
              x={group.x + 4} y={group.y + GROUP_H * 0.6}
              width={GROUP_W - 8} height={GROUP_H * 0.4 - 4}
              rx={RADIUS - 4} ry={RADIUS - 4}
              fill={group.style.innerDark}
            />

            {/* Decorative corner accent */}
            <circle cx={group.x + RADIUS - 2} cy={group.y + RADIUS - 2} r="5" fill={group.style.glow} opacity="0.2" />

            {/* Items inside */}
            {group.itemPositions.map((pos) => (
              <g key={pos.index} className="c-item" style={{ animationDelay: `${pos.delay}s` }}>
                <Icon size={ITEM_SIZE} />
              </g>
            ))}

            {/* Group label */}
            <text
              x={group.x + GROUP_W / 2}
              y={group.y + GROUP_H + 22}
              textAnchor="middle"
              fontSize="12"
              fontWeight="700"
              fill="rgba(49,46,129,0.5)"
              fontFamily="'Baloo 2', system-ui, sans-serif"
            >
              {scene.groupLabel}
            </text>

            {/* Badge count */}
            <rect x={group.x + GROUP_W - 30} y={group.y - 10} width="26" height="18" rx="9"
              fill={group.style.glow} opacity="0.15" />
            <text x={group.x + GROUP_W - 17} y={group.y + 4}
              textAnchor="middle" fontSize="10" fontWeight="800"
              fill={group.style.glow} fontFamily="'Baloo 2', system-ui, sans-serif">
              {scene.perGroup}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

export default GroupsScene;
