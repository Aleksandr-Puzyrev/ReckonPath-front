import type { WorldPlan } from "../world-plans";

const STARS_TWO_SHARE = 1.15;

export const expectedFactor = (plan: WorldPlan, levelNumber: number, levelId: string) => {
  if (levelId === plan.restLevel) return plan.factor.start;
  const span = plan.lastLevel - plan.firstLevel;
  const progress = span === 0 ? 0 : (levelNumber - plan.firstLevel) / span;
  return plan.factor.start + (plan.factor.end - plan.factor.start) * progress;
};

export interface LevelLimits {
  moveLimit: number;
  stars: [number, number];
}

export const limitsFor = (norm: number, factor: number): LevelLimits => ({
  moveLimit: Math.ceil(factor * norm),
  stars: [Math.ceil(norm), Math.ceil(STARS_TWO_SHARE * norm)],
});
