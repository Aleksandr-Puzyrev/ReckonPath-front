import * as fc from "fast-check";

import type { Board } from "../model/types";

import {
  edgeKey,
  enterCost,
  gridNeighbors,
  passableNeighbors,
  toCell,
  toIdx,
  UNREACHABLE,
} from "./grid";

const board = (overrides: Partial<Board> = {}): Board => ({
  rows: 3,
  cols: 3,
  kinds: ["open", "stream", "heavy", "rock", "open", "stream", "open", "open", "open"],
  bridges: new Set([5]),
  fences: new Set([edgeKey(4, 7)]),
  targets: [8],
  bombs: [],
  beacons: [],
  buoys: [],
  targetOrder: false,
  ...overrides,
});

describe("indices", () => {
  test("round-trips between cells and indices", () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 9 }), fc.nat(80), (cols, idx) => {
        expect(toIdx(cols, toCell(cols, idx))).toBe(idx);
      }),
    );
  });

  test("builds the same edge key in both directions", () => {
    expect(edgeKey(3, 4)).toBe(edgeKey(4, 3));
    expect(edgeKey(3, 4)).toBe(3 * 128 + 4);
  });
});

describe("neighbours", () => {
  test("lists grid neighbours in N, E, S, W order", () => {
    expect(gridNeighbors(board(), 4)).toEqual([
      { dir: "N", idx: 1 },
      { dir: "E", idx: 5 },
      { dir: "S", idx: 7 },
      { dir: "W", idx: 3 },
    ]);
  });

  test("skips rocks and fenced edges", () => {
    expect(passableNeighbors(board(), 4).map(({ idx }) => idx)).toEqual([1, 5]);
  });
});

describe("enterCost", () => {
  test.each([
    [0, 1],
    [1, 3],
    [2, 2],
    [3, UNREACHABLE],
    [5, 1],
  ])("cell %i costs %i to enter", (idx, cost) => {
    expect(enterCost(board(), idx)).toBe(cost);
  });
});
