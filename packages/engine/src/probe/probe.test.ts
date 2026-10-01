import { createBoard } from "../level/create-board";
import { allPairs } from "../distance/distance";
import { makeLevel } from "../test-utils/make-level";

import { compareHotCold, directionOf, heatOf, heatThresholds } from "./probe";

const DEFAULT_HEAT = { hotPct: 0.2, warmPct: 0.45 };

describe("heatThresholds", () => {
  test.each([
    [0, 2, 3],
    [6, 2, 3],
    [8, 2, 4],
    [16, 4, 8],
    [20, 4, 9],
    [24, 5, 11],
  ])("heatD %i gives hot <= %i and warm <= %i", (heatD, hotMax, warmMax) => {
    expect(heatThresholds(heatD, DEFAULT_HEAT)).toEqual({ hotMax, warmMax });
  });

  test("keeps warm strictly above hot", () => {
    expect(heatThresholds(10, { hotPct: 0.5, warmPct: 0.5 })).toEqual({ hotMax: 5, warmMax: 6 });
  });

  test("follows custom remote-config shares", () => {
    expect(heatOf(3, 10, { hotPct: 0.3, warmPct: 0.6 })).toBe("hot");
    expect(heatOf(7, 10, { hotPct: 0.3, warmPct: 0.6 })).toBe("cold");
  });
});

describe("directionOf", () => {
  test("throws for a cell with no passable neighbour", () => {
    const level = makeLevel({
      rows: 4,
      cols: 4,
      targets: [[3, 3]],
      fences: [
        [
          [0, 0],
          [0, 1],
        ],
        [
          [0, 0],
          [1, 0],
        ],
      ],
      probeMode: "direction",
    });
    const { board } = createBoard(level);

    expect(() => directionOf({ board, dist: allPairs(board), found: new Set() }, 0)).toThrow(
      "Cell 0 has no passable neighbours",
    );
  });
});

describe("compareHotCold", () => {
  test.each([
    [5, null, "none"],
    [4, 5, "warmer"],
    [6, 5, "colder"],
    [5, 5, "same"],
  ] as const)("value %i after %s is %s", (value, lastValue, expected) => {
    expect(compareHotCold(value, lastValue)).toBe(expected);
  });
});
