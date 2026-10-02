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
];

export const TUTORIAL_LEVEL = "c-1";
