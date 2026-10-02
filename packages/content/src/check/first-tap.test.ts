import type { LevelInput } from "@reckon-path/engine";

import { firstNumberShare } from "./first-tap";

const level = (overrides: Partial<LevelInput>): LevelInput => ({
  v: 2,
  id: "c-check",
  world: 1,
  rows: 4,
  cols: 4,
  targets: [[1, 2]],
  probeMode: "distance",
  ...overrides,
});

describe("firstNumberShare", () => {
  test("takes the worst first tap without beacons", () => {
    // The worst first tap on an empty 4×4 keeps 6 of 16 placements in one answer group (худший первый тап на пустом поле 4×4 оставляет 6 из 16 вариантов).
    expect(firstNumberShare(level({}))).toBeCloseTo(6 / 16);
  });

  test("takes the beacon numbers on a beacon level", () => {
    // Beacon A1 splits the 15 candidates by distance 1…6; the largest group, distance 3, has 4 cells (маяк A1 делит 15 вариантов по расстоянию; самая большая группа — 4 клетки).
    expect(firstNumberShare(level({ beacons: [[0, 0]] }))).toBeCloseTo(4 / 15);
  });
});
