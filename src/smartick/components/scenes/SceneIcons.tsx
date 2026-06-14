/**
 * SceneIcons — SVG icon set for visual problem scenes.
 *
 * Beautiful gradient icons for children's educational context.
 * Replaces emoji with proper SVG illustrations.
 *
 * @module components/scenes/SceneIcons
 */

import React from "react";

type IconProps = { size?: number };

const Ball: React.FC<IconProps> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" fill="url(#ball-grad)" />
    <path d="M8 6 Q12 4 16 6" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" fill="none" />
    <path d="M6 12 Q12 14 18 12" stroke="rgba(255,255,255,0.2)" strokeWidth="1" fill="none" />
    <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
    <circle cx="9" cy="9" r="1.5" fill="rgba(255,255,255,0.25)" />
  </svg>
);

const Apple: React.FC<IconProps> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 5C10 5 8 7 8 10C8 14 12 19 12 19C12 19 16 14 16 10C16 7 14 5 12 5Z" fill="url(#apple-grad)" />
    <path d="M12 5C11 5 10 6 10 7" stroke="rgba(255,255,255,0.2)" strokeWidth="1" fill="none" />
    <path d="M10.5 5C10.5 5 11 3.5 12 3.5C13 3.5 13.5 5 13.5 5" stroke="url(#apple-grad)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    {/* Highlight */}
    <path d="M10 9C10 9 10.5 8 12 8" stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeLinecap="round" fill="none" />
  </svg>
);

const Cookie: React.FC<IconProps> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" fill="url(#cookie-grad)" />
    <circle cx="12" cy="12" r="9" stroke="rgba(180,120,60,0.3)" strokeWidth="1" />
    <circle cx="9" cy="9" r="1.8" fill="#6B4226" opacity="0.5" />
    <circle cx="14" cy="10" r="1.5" fill="#6B4226" opacity="0.4" />
    <circle cx="11" cy="14" r="1.6" fill="#6B4226" opacity="0.45" />
    <circle cx="15" cy="15" r="1.2" fill="#6B4226" opacity="0.35" />
    {/* Highlight */}
    <circle cx="8.5" cy="8.5" r="1.5" fill="rgba(255,255,255,0.2)" />
  </svg>
);

const Book: React.FC<IconProps> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="5" y="3" width="14" height="18" rx="2" fill="url(#book-grad)" />
    <rect x="5" y="3" width="14" height="18" rx="2" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
    <line x1="7" y1="7" x2="17" y2="7" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="7" y1="10" x2="14" y2="10" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="7" y1="13" x2="16" y2="13" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeLinecap="round" />
    <path d="M12 3V21" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
  </svg>
);

const Star: React.FC<IconProps> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 2L14.5 9.5L22 9.5L16 14.5L18 22L12 17L6 22L8 14.5L2 9.5L9.5 9.5Z" fill="url(#star-grad)" />
    <path d="M12 2L14.5 9.5L22 9.5L16 14.5L18 22L12 17L6 22L8 14.5L2 9.5L9.5 9.5Z" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
    <path d="M12 5L13.5 10.5L18 10.5L14.5 13.5L15.5 18L12 15L8.5 18L9.5 13.5L6 10.5L10.5 10.5Z" fill="rgba(255,255,255,0.15)" />
  </svg>
);

const Flower: React.FC<IconProps> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="3" fill="url(#flower-grad)" />
    {[0, 60, 120, 180, 240, 300].map((angle, i) => (
      <ellipse
        key={i}
        cx={12 + 6 * Math.cos((angle * Math.PI) / 180)}
        cy={12 + 6 * Math.sin((angle * Math.PI) / 180)}
        rx="3.5"
        ry="2.5"
        transform={`rotate(${angle}, ${12 + 6 * Math.cos((angle * Math.PI) / 180)}, ${12 + 6 * Math.sin((angle * Math.PI) / 180)})`}
        fill="url(#flower-grad)"
        opacity="0.8"
      />
    ))}
    <circle cx="12" cy="12" r="2" fill="rgba(255,255,255,0.3)" />
  </svg>
);

const Candy: React.FC<IconProps> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <ellipse cx="12" cy="12" rx="4" ry="8" fill="url(#candy-grad)" transform="rotate(-30, 12, 12)" />
    <path d="M8 8L6 5" stroke="url(#candy-grad)" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M16 16L18 19" stroke="url(#candy-grad)" strokeWidth="2.5" strokeLinecap="round" />
    {/* Stripes */}
    <line x1="9" y1="11" x2="15" y2="8" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" transform="rotate(-30, 12, 12)" />
    <line x1="9" y1="14" x2="15" y2="11" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" transform="rotate(-30, 12, 12)" />
  </svg>
);

const Pencil: React.FC<IconProps> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M17 3L21 7L7 21H3V17L17 3Z" fill="url(#pencil-grad)" />
    <path d="M17 3L21 7" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M3 21L7 17" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeLinecap="round" />
    <rect x="9.5" y="9.5" width="3" height="8" rx="1.5" fill="rgba(255,255,255,0.15)" transform="rotate(45, 11, 13)" />
  </svg>
);

const Water: React.FC<IconProps> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 2C12 2 6 9 6 14C6 17.3 8.7 20 12 20C15.3 20 18 17.3 18 14C18 9 12 2 12 2Z" fill="url(#water-grad)" />
    <path d="M12 2C12 2 6 9 6 14C6 17.3 8.7 20 12 20" stroke="rgba(255,255,255,0.15)" strokeWidth="1" fill="none" />
    <circle cx="10" cy="13" r="0.8" fill="rgba(255,255,255,0.2)" />
    <circle cx="13" cy="15" r="0.6" fill="rgba(255,255,255,0.15)" />
  </svg>
);

const Coin: React.FC<IconProps> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" fill="url(#coin-grad)" />
    <circle cx="12" cy="12" r="9" stroke="rgba(200,160,60,0.4)" strokeWidth="1.5" />
    <circle cx="12" cy="12" r="6" fill="none" stroke="rgba(200,160,60,0.2)" strokeWidth="1" />
    <text x="12" y="15" textAnchor="middle" fontSize="10" fontWeight="800" fill="rgba(200,160,60,0.6)" fontFamily="system-ui">€</text>
    <circle cx="9" cy="9" r="2" fill="rgba(255,255,255,0.15)" />
  </svg>
);

interface SceneIconMap {
  [key: string]: React.FC<IconProps>;
}

export const SCENE_ICONS: SceneIconMap = {
  ball: Ball,
  apple: Apple,
  cookie: Cookie,
  book: Book,
  star: Star,
  flower: Flower,
  candy: Candy,
  pencil: Pencil,
  water: Water,
  coin: Coin,
};

export const ICON_GRADIENTS = (
  <>
    <defs>
      <linearGradient id="ball-grad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FF6B35" />
        <stop offset="100%" stopColor="#E85D26" />
      </linearGradient>
      <linearGradient id="apple-grad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FF4757" />
        <stop offset="100%" stopColor="#E83545" />
      </linearGradient>
      <linearGradient id="cookie-grad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FDBF6E" />
        <stop offset="100%" stopColor="#E8A84E" />
      </linearGradient>
      <linearGradient id="book-grad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#4F46E5" />
        <stop offset="100%" stopColor="#3730A3" />
      </linearGradient>
      <linearGradient id="star-grad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FDCB6E" />
        <stop offset="100%" stopColor="#E8B54E" />
      </linearGradient>
      <linearGradient id="flower-grad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FF9ECD" />
        <stop offset="100%" stopColor="#E87EB5" />
      </linearGradient>
      <linearGradient id="candy-grad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#A29BFE" />
        <stop offset="100%" stopColor="#8179E8" />
      </linearGradient>
      <linearGradient id="pencil-grad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#00B894" />
        <stop offset="100%" stopColor="#00A07D" />
      </linearGradient>
      <linearGradient id="water-grad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#74B9FF" />
        <stop offset="100%" stopColor="#5499E8" />
      </linearGradient>
      <linearGradient id="coin-grad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FDCB6E" />
        <stop offset="100%" stopColor="#E8B54E" />
      </linearGradient>
    </defs>
  </>
);

export default Ball;
