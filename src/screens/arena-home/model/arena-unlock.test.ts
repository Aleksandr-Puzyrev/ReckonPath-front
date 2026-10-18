import { CAMPAIGN_LEVELS } from "@entities/level";
import type { LevelBest } from "@entities/progress";

import { ARENA_UNLOCK_LEVEL, isArenaUnlocked, passedTowardsArena } from "./arena-unlock";

const bestOf = (count: number): Record<string, LevelBest> =>
  Object.fromEntries(
    CAMPAIGN_LEVELS.slice(0, count).map(({ level }) => [level.id, { stars: 3, moves: 5 }]),
  );

describe("arena unlock", () => {
  test("counts the passed levels up to level 12 (ARN-01)", () => {
    expect(passedTowardsArena(bestOf(9))).toBe(9);
    expect(passedTowardsArena(bestOf(20))).toBe(ARENA_UNLOCK_LEVEL);
  });

  test("keeps the arena locked before level 12 is passed", () => {
    expect(isArenaUnlocked(bestOf(11))).toBe(false);
  });

  test("opens the arena once level 12 is passed", () => {
    expect(isArenaUnlocked(bestOf(12))).toBe(true);
  });
});
