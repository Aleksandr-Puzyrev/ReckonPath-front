import type { LevelInput } from "@reckon-path/engine";

import { firstNumberShare, isBombOnFirstTap } from "./first-tap";

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

  test("takes the best first tap by directions in the «Курс» mode (decision 0045 #9)", () => {
    // A centre tap on an empty 4×4 leaves at most 6 of 16 placements behind one direction (центральный тап на пустом 4×4 оставляет за одним направлением не больше 6 из 16 вариантов).
    expect(firstNumberShare(level({ probeMode: "direction" }))).toBeCloseTo(6 / 16);
  });

  test("measures the distance to target №1 when the order matters", () => {
    const share = firstNumberShare(
      level({
        rows: 5,
        cols: 5,
        targets: [
          [0, 0],
          [4, 4],
        ],
        targetOrder: true,
      }),
    );

    expect(share).toBeLessThan(1);
  });
});

describe("isBombOnFirstTap", () => {
  // On an empty 5×5 the bot opens with a corner, so a corner bomb is on its first tap and a centre one is not (на пустом 5×5 бот начинает с угла: бомба в углу попадает на первый тап, в центре — нет).
  const withBomb = (bomb: [number, number]) =>
    level({ rows: 5, cols: 5, targets: [[0, 0]], bombs: [bomb] });

  test("finds a bomb on a cell the bot opens with (Part 6 §8.1 p.3)", () => {
    expect(isBombOnFirstTap(withBomb([4, 4]))).toBe(true);
  });

  test("accepts a bomb away from the bot's first tap", () => {
    expect(isBombOnFirstTap(withBomb([2, 2]))).toBe(false);
  });
});
