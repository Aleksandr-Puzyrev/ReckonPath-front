import * as fc from "fast-check";

import type { Board, CellKind } from "../model/types";

const KIND_WEIGHTS: { arbitrary: fc.Arbitrary<CellKind>; weight: number }[] = [
  { arbitrary: fc.constant("open"), weight: 6 },
  { arbitrary: fc.constant("stream"), weight: 2 },
  { arbitrary: fc.constant("heavy"), weight: 1 },
  { arbitrary: fc.constant("rock"), weight: 1 },
];

export const arbitraryBoard = (): fc.Arbitrary<Board> =>
  fc
    .record({ rows: fc.integer({ min: 4, max: 6 }), cols: fc.integer({ min: 4, max: 6 }) })
    .chain(({ rows, cols }) => {
      const size = rows * cols;
      return fc
        .record({
          kinds: fc.array(fc.oneof(...KIND_WEIGHTS), { minLength: size, maxLength: size }),
          bridgeMask: fc.array(fc.boolean(), { minLength: size, maxLength: size }),
          fenceSeeds: fc.array(fc.integer({ min: 0, max: size * 2 - 1 }), { maxLength: size }),
        })
        .map(({ kinds, bridgeMask, fenceSeeds }): Board => {
          const fences = new Set<number>();
          fenceSeeds.forEach((seed) => {
            const idx = Math.floor(seed / 2);
            const isHorizontal = seed % 2 === 0;
            const next = isHorizontal ? idx + 1 : idx + cols;
            const isValid = isHorizontal ? idx % cols < cols - 1 : next < size;
            if (isValid) fences.add(Math.min(idx, next) * 128 + Math.max(idx, next));
          });
          const passable = kinds.flatMap((kind, idx) => (kind === "rock" ? [] : [idx]));

          return {
            rows,
            cols,
            kinds,
            bridges: new Set(
              kinds.flatMap((kind, idx) => (kind === "stream" && bridgeMask[idx] ? [idx] : [])),
            ),
            fences,
            targets: passable.slice(0, 1),
            bombs: [],
            beacons: [],
            buoys: [],
            targetOrder: false,
          };
        });
    });

// Independent reference: Bellman-Ford over raw board data, no engine helpers (независимый эталон: Беллман–Форд по исходным данным, без функций движка).
export const referenceDistances = (board: Board, source: number) => {
  const size = board.rows * board.cols;
  const cost = (idx: number) => {
    const kind = board.kinds[idx];
    if (kind === "stream") return board.bridges.has(idx) ? 1 : 3;
    if (kind === "heavy") return 2;
    return 1;
  };
  const dist = Array.from({ length: size }, () => Number.POSITIVE_INFINITY);
  if (board.kinds[source] === "rock") return dist;
  dist[source] = 0;

  for (let round = 0; round < size; round += 1) {
    for (let from = 0; from < size; from += 1) {
      const base = dist[from] ?? Number.POSITIVE_INFINITY;
      if (base === Number.POSITIVE_INFINITY) continue;
      const row = Math.floor(from / board.cols);
      const col = from % board.cols;
      const candidates = [
        row > 0 ? from - board.cols : -1,
        row < board.rows - 1 ? from + board.cols : -1,
        col > 0 ? from - 1 : -1,
        col < board.cols - 1 ? from + 1 : -1,
      ];
      candidates.forEach((to) => {
        if (to < 0 || board.kinds[to] === "rock") return;
        if (board.fences.has(Math.min(from, to) * 128 + Math.max(from, to))) return;
        dist[to] = Math.min(dist[to] ?? Number.POSITIVE_INFINITY, base + cost(to));
      });
    }
  }

  return dist;
};
