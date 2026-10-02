import type { WorldPlan } from "../world-plans";

import { expectedFactor, limitsFor } from "./level-limits";

const PLAN: WorldPlan = {
  world: 1,
  firstLevel: 1,
  lastLevel: 5,
  factor: { start: 2, end: 1.6 },
  restLevel: "c-4",
};

describe("expectedFactor", () => {
  test("goes linearly from the world's start to its end", () => {
    expect(expectedFactor(PLAN, 1, "c-1")).toBeCloseTo(2);
    expect(expectedFactor(PLAN, 3, "c-3")).toBeCloseTo(1.8);
    expect(expectedFactor(PLAN, 5, "c-5")).toBeCloseTo(1.6);
  });

  test("gives the rest level the start factor", () => {
    expect(expectedFactor(PLAN, 4, "c-4")).toBe(2);
  });
});

describe("limitsFor", () => {
  test("rounds the limit and both star thresholds up", () => {
    expect(limitsFor(2.5, 1.7)).toEqual({ moveLimit: 5, stars: [3, 3] });
    expect(limitsFor(3, 2)).toEqual({ moveLimit: 6, stars: [3, 4] });
  });
});
