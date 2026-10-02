import type { LevelInput } from "@reckon-path/engine";

import { checkLevel } from "./check-level";

const level = (overrides: Partial<LevelInput>): LevelInput => ({
  v: 2,
  id: "c-2",
  world: 1,
  rows: 4,
  cols: 4,
  targets: [[2, 3]],
  probeMode: "distance",
  ...overrides,
});

describe("checkLevel", () => {
  test("asks to recompute out-of-date limits", () => {
    expect(checkLevel(level({ moveLimit: 20, stars: [1, 2] }), 2).errors).toContain(
      "LIMITS_OUT_OF_DATE",
    );
  });

  test("reports a missing move limit outside the tutorial", () => {
    expect(checkLevel(level({}), 2).errors).toEqual(
      expect.arrayContaining(["MOVE_LIMIT", "LIMITS_OUT_OF_DATE"]),
    );
  });

  test("exempts the tutorial from the move limit but not from having none", () => {
    expect(checkLevel(level({ id: "c-1" }), 1).errors).toEqual([]);
    expect(checkLevel(level({ id: "c-1", moveLimit: 9, stars: [3, 4] }), 1).errors).toContain(
      "TUTORIAL_LIMIT",
    );
  });

  test("rejects a level outside every world plan", () => {
    expect(checkLevel(level({ id: "c-99" }), 99).errors).toContain("NO_WORLD_PLAN");
  });

  test("rejects a first number that tells almost nothing", () => {
    // With five targets a centre beacon almost always shows 1, so its number tells little (при пяти целях маяк в центре почти всегда показывает 1).
    const crowded = level({
      targets: [
        [0, 0],
        [0, 3],
        [2, 3],
        [3, 0],
        [3, 3],
      ],
      beacons: [[1, 1]],
    });
    expect(checkLevel(crowded, 2).errors).toContain("FIRST_NUMBER");
  });

  test("passes a level with computed limits", () => {
    const { expected } = checkLevel(level({}), 2);
    if (expected === null) throw new Error("Level 2 has a plan");
    expect(checkLevel(level(expected), 2).errors).toEqual([]);
  });
});
