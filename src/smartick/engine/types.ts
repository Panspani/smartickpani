// === Constants (const object + extracted type pattern) ===

export const SKILL_IDS = {
  UNIDAD_5: "skill-05",
  UNIDAD_6: "skill-06",
  UNIDAD_7: "skill-07",
  UNIDAD_8: "skill-08",
  UNIDAD_9: "skill-09",
  UNIDAD_10: "skill-10",
  UNIDAD_11: "skill-11",
  UNIDAD_12: "skill-12",
} as const;

export type SkillId = (typeof SKILL_IDS)[keyof typeof SKILL_IDS];

export const SUB_SKILL_IDS = {
  // Unidad 5 — Práctica de la multiplicación
  TABLAS_1_10: "skill-05-01",
  MULT_1_CIFRA: "skill-05-02",
  MULT_2_CIFRAS: "skill-05-03",
  MULT_PROBLEMAS: "skill-05-04",
  // Unidad 6 — La división
  DIV_EXACTAS: "skill-06-01",
  DIV_RELACION_MULT: "skill-06-02",
  DIV_PROBLEMAS: "skill-06-03",
  // Unidad 7 — Práctica de la división
  DIV_CON_RESTO: "skill-07-01",
  DIV_2_CIFRAS: "skill-07-02",
  DIV_PROBLEMAS_AVANZADOS: "skill-07-03",
  // Unidad 8 — Las figuras planas
  FIG_CLASIFICACION: "skill-08-01",
  FIG_PERIMETRO: "skill-08-02",
  FIG_SIMETRIA: "skill-08-03",
  // Unidad 9 — Medidas de longitud
  LONG_M_CM_MM: "skill-09-01",
  LONG_CONVERSIONES: "skill-09-02",
  LONG_ESTIMACION: "skill-09-03",
  // Unidad 10 — La capacidad y la masa
  CAP_L_ML: "skill-10-01",
  MASA_G_KG: "skill-10-02",
  CAP_MASA_CONVERSIONES: "skill-10-03",
  CAP_MASA_PROBLEMAS: "skill-10-04",
  // Unidad 11 — El tiempo y el dinero
  TIEMPO_RELOJ: "skill-11-01",
  TIEMPO_HORAS_MIN: "skill-11-02",
  DINERO_EUROS: "skill-11-03",
  DINERO_PROBLEMAS: "skill-11-04",
  // Unidad 12 — Los cuerpos geométricos
  CUERPOS_PRISMAS_PIRAMIDES: "skill-12-01",
  CUERPOS_CILINDROS_CONOS_ESFERAS: "skill-12-02",
  CUERPOS_ARISTAS_VERTICES: "skill-12-03",
} as const;

export type SubSkillId = (typeof SUB_SKILL_IDS)[keyof typeof SUB_SKILL_IDS];

export const TIERS = { EASY: 1, MEDIUM: 2, HARD: 3 } as const;
export type Tier = (typeof TIERS)[keyof typeof TIERS];

export const PHASES = { WARM_UP: "warmup", CORE: "core", COOL_DOWN: "cooldown" } as const;
export type Phase = (typeof PHASES)[keyof typeof PHASES];

export const VIEWS = {
  HOME: "dashboard",
  SESSION: "session",
  RESULTS: "results",
  CORRECTION: "correction",
  PARENT: "parent",
  MINIGAME: "minigame",
} as const;
export type View = (typeof VIEWS)[keyof typeof VIEWS];

export const PROBLEM_TYPES = {
  MULTIPLE_CHOICE: "multiple-choice",
  NUMERIC_INPUT: "numeric-input",
  CLOCK: "clock",
  SHAPE: "shape",
  SOLID: "solid",
  BALANCE: "balance",
  OBJECT_GROUP: "object-group",
  COINS: "coins",
  MEASUREMENT: "measurement",
} as const;
export type ProblemType = (typeof PROBLEM_TYPES)[keyof typeof PROBLEM_TYPES];

// === Core Data Interfaces ===

export interface SubSkillState {
  id: SubSkillId;
  name: string;
  mastered: boolean;
  accuracy: number;           // 0–100
  attempts: number;
  correctCount: number;
  totalResponseTimeMs: number;
  lastAttempts: boolean[];    // rolling window of 10 (FIFO)
}

export interface SkillState {
  id: SkillId;
  name: string;
  unidad: number;             // 5–12
  trimestre: number;          // 2 | 3
  skillMastered: boolean;
  masteryPercentage: number;  // 0–100
  lastPracticed: string | null; // ISO 8601
  subSkills: SubSkillState[];
}

export type SkillMap = Record<SkillId, SkillState>;

export interface Problem {
  id: string;
  skillId: SkillId;
  subSkillId: SubSkillId;
  text: string;               // Spanish question
  type: ProblemType;
  answer: number;             // Correct answer
  options?: number[];         // 4 items for multiple-choice
  visualData?: VisualData;    // visual/interactive problem data
  tier: Tier;
  phase: Phase;
}

export interface ProblemResult {
  problem: Problem;
  isCorrect: boolean;
  responseTimeMs: number | null; // null = timed out
}

export interface AdaptiveInput {
  skillMap: SkillMap;
  recentResults: ProblemResult[];
  currentStreak: number;
  currentPhase: Phase;
  problemsInPhase: number;
  consecutiveSameSkill: number;
}

export interface SubSkillAttempt {
  isCorrect: boolean;
  responseTimeMs: number;
}

// === Session ===

export interface SessionState {
  active: boolean;
  phase: Phase;
  elapsedSeconds: number;
  currentStreak: number;
  maxStreak: number;
  starsEarned: number;
  problemsAnswered: number;
  currentProblemIndex: number;
  problemQueue: Problem[];
  results: ProblemResult[];
  startTime: string;          // ISO 8601
}

export interface SessionResult {
  id: string;
  date: string;               // ISO 8601
  durationSeconds: number;
  phasesCompleted: Record<Phase, boolean>;
  accuracy: number;           // 0–100
  totalStars: number;
  streakMax: number;
  skillsPracticed: SkillId[];
  problems: ProblemResult[];
  badgesEarned: Badge[];
}

// === Mastery ===

export type MasteryLevel = "mastered" | "not-mastered";

export interface SubSkillMastery {
  accuracy: number;             // 0–100 from last 10 attempts
  attempts: number;
  correctCount: number;
  totalResponseTimeMs: number;
  lastAttempts: boolean[];      // rolling window of 10
  masteryLevel: MasteryLevel;
}

export interface SkillMasteryState {
  /** Skill-level mastery percentages (0–100) */
  skillPercentages: Record<SkillId, number>;
  /** Sub-skill-level mastery details */
  subSkills: Record<SubSkillId, SubSkillMastery>;
}

export interface ScoringState {
  stars: number;
  streak: number;
  totalCorrect: number;
  totalAttempts: number;
}

// === Badges ===

export interface Badge {
  id: string;
  name: string;
  description: string;
  earnedAt: string | null;     // ISO 8601 or null
}

export const BADGE_DEFINITIONS = {
  FIRST_SESSION: {
    id: "first-session",
    name: "Primera sesión",
    description: "Completaste tu primera sesión",
  },
  STREAK_5_DAYS: {
    id: "streak-5-days",
    name: "Racha de 5",
    description: "Completaste sesiones en 5 días consecutivos",
  },
  MASTER_MATHEMATICIAN: {
    id: "master-mathematician",
    name: "Matemático",
    description: "Dominaste todas las habilidades",
  },
  SPEED_DEMON: {
    id: "speed-demon",
    name: "Rápido",
    description: "Respuesta promedio menor a 15 segundos en 5 sesiones",
  },
} as const;

// === Visual Data Types (for interactive problems) ===

export interface ClockVisual {
  hour: number;         // 1–12
  minute: number;       // 0–59
  showNumbers: boolean; // show 1-12 around the clock face
}

export interface ShapeVisual {
  shapeName: string;    // "triángulo", "cuadrado", etc.
  sides: number;
  showLabels: boolean;
  highlightProperty?: "sides" | "vertices" | "symmetry";
}

export interface SolidVisual {
  solidName: string;    // "prisma triangular", "pirámide cuadrangular", "cilindro", etc.
  vertices: number;
  edges: number;
  faces: number;
}

export interface BalanceVisual {
  leftLabel: string;    // e.g. "500 g" or "3 kg"
  rightLabel: string;   // e.g. "? g" or "2 kg"
  leftValue: number;    // numeric value
  rightValue: number;   // numeric value (unknown = -1)
  item: string;         // what's being weighed ("harina", "agua", etc.)
}

export interface ObjectGroupVisual {
  groups: number;
  perGroup: number;
  icon: string;         // emoji to show: "⭐", "🍎", "📚"
  highlightIndex?: number;
}

export interface CoinVisual {
  coins: Array<{
    value: number;      // centimos: 1, 2, 5, 10, 20, 50, 100, 200
    count: number;
  }>;
  totalCentimos: number;
}

export interface MeasurementVisual {
  kind: "ruler" | "jug" | "scale";
  value: number;
  unit: string;         // "cm", "mm", "L", "mL", "kg", "g"
  maxValue: number;
  showMarker: boolean;
}

export type VisualData =
  | { type: "clock"; data: ClockVisual }
  | { type: "shape"; data: ShapeVisual }
  | { type: "solid"; data: SolidVisual }
  | { type: "balance"; data: BalanceVisual }
  | { type: "object-group"; data: ObjectGroupVisual }
  | { type: "coins"; data: CoinVisual }
  | { type: "measurement"; data: MeasurementVisual };

// === Settings ===

export interface Settings {
  audioEnabled: boolean;
  language: string;
  lastSessionDate: string | null;
  streakDays: number;
  lastActivityDate: string | null;
}

export const DEFAULT_SETTINGS: Settings = {
  audioEnabled: true,
  language: "es-AR",
  lastSessionDate: null,
  streakDays: 0,
  lastActivityDate: null,
};

// === Persisted State (all localStorage data) ===

export interface PersistedState {
  skills: SkillMap;
  sessions: SessionResult[];
  settings: Settings;
  badges: Badge[];
  sessionState: SessionState | null;
}

// === Generator Interface (for Phase 2) ===

export interface GeneratorContext {
  seed: number;
  tier: Tier;
  phase: Phase;
  skillId: SkillId;
  subSkillId: SubSkillId;
  sessionProblemIndex: number;
}

export interface GeneratorResult {
  text: string;
  answer: number;
  type: ProblemType;
  options?: number[];
  visualData?: VisualData;
}

export type ProblemGenerator = (context: GeneratorContext) => GeneratorResult;
