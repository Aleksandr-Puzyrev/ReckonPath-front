export interface WorldPlan {
  world: number;
  firstLevel: number;
  lastLevel: number;
  factor: { start: number; end: number };
  restLevel: string;
}

// Move limit as a share of the bot norm, from the world's start to its end (запас ходов как доля нормы бота от начала мира к концу).
export const WORLD_PLANS: readonly WorldPlan[] = [
  { world: 1, firstLevel: 1, lastLevel: 12, factor: { start: 2, end: 1.6 }, restLevel: "c-10" },
  { world: 2, firstLevel: 13, lastLevel: 24, factor: { start: 1.7, end: 1.5 }, restLevel: "c-18" },
  { world: 3, firstLevel: 25, lastLevel: 36, factor: { start: 1.6, end: 1.45 }, restLevel: "c-30" },
  { world: 4, firstLevel: 37, lastLevel: 48, factor: { start: 1.55, end: 1.4 }, restLevel: "c-42" },
  { world: 5, firstLevel: 49, lastLevel: 61, factor: { start: 1.5, end: 1.35 }, restLevel: "c-54" },
  { world: 6, firstLevel: 62, lastLevel: 74, factor: { start: 1.45, end: 1.3 }, restLevel: "c-67" },
];

export const TUTORIAL_LEVEL = "c-1";
