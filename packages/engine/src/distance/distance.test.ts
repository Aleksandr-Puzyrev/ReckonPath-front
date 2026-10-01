import * as fc from "fast-check";

import { cellCount, enterCost, UNREACHABLE } from "../grid/grid";
import { arbitraryBoard, referenceDistances } from "../test-utils/arbitrary-board";

import { allPairs, dijkstra, distanceBetween } from "./distance";

describe("dijkstra", () => {
  test("matches an independent Bellman-Ford reference on random boards", () => {
    fc.assert(
      fc.property(arbitraryBoard(), fc.nat(), (board, seed) => {
        const source = seed % cellCount(board);
        const expected = referenceDistances(board, source).map((value) =>
          value === Number.POSITIVE_INFINITY ? UNREACHABLE : value,
        );
        expect(Array.from(dijkstra(board, source))).toEqual(expected);
      }),
      { numRuns: 300 },
    );
  });

  test("distance from a cell to itself is zero unless it is a rock", () => {
    fc.assert(
      fc.property(arbitraryBoard(), (board) => {
        const dist = allPairs(board);
        const size = cellCount(board);
        board.kinds.forEach((kind, idx) => {
          expect(distanceBetween(dist, size, idx, idx)).toBe(kind === "rock" ? UNREACHABLE : 0);
        });
      }),
      { numRuns: 100 },
    );
  });

  test("satisfies the triangle inequality", () => {
    fc.assert(
      fc.property(arbitraryBoard(), fc.nat(), fc.nat(), fc.nat(), (board, x, y, z) => {
        const size = cellCount(board);
        const [a, b, c] = [x % size, y % size, z % size];
        const dist = allPairs(board);
        const ab = distanceBetween(dist, size, a, b);
        const bc = distanceBetween(dist, size, b, c);
        if (ab === UNREACHABLE || bc === UNREACHABLE) return;
        expect(distanceBetween(dist, size, a, c)).toBeLessThanOrEqual(ab + bc);
      }),
      { numRuns: 200 },
    );
  });

  test("is asymmetric when the costs of the two cells differ", () => {
    fc.assert(
      fc.property(arbitraryBoard(), (board) => {
        const dist = allPairs(board);
        const size = cellCount(board);
        for (let a = 0; a < size; a += 1) {
          for (let b = 0; b < size; b += 1) {
            const ab = distanceBetween(dist, size, a, b);
            const ba = distanceBetween(dist, size, b, a);
            if (ab === UNREACHABLE) continue;
            expect(ab - ba).toBe(enterCost(board, b) - enterCost(board, a));
          }
        }
      }),
      { numRuns: 50 },
    );
  });
});
