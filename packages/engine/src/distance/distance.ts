import { cellCount, enterCost, passableNeighbors, UNREACHABLE } from "../grid/grid";
import type { Board, Idx } from "../model/types";

export const dijkstra = (board: Board, source: Idx): Int16Array => {
  const size = cellCount(board);
  const dist = new Int16Array(size).fill(UNREACHABLE);
  if (board.kinds[source] === "rock") return dist;

  const visited = new Uint8Array(size);
  dist[source] = 0;

  for (let step = 0; step < size; step += 1) {
    let current = -1;
    let best = UNREACHABLE;
    for (let idx = 0; idx < size; idx += 1) {
      const value = dist[idx] ?? UNREACHABLE;
      if (visited[idx] === 0 && value < best) {
        best = value;
        current = idx;
      }
    }
    if (current === -1) break;
    visited[current] = 1;

    passableNeighbors(board, current).forEach(({ idx }) => {
      const candidate = best + enterCost(board, idx);
      if (candidate < (dist[idx] ?? UNREACHABLE)) dist[idx] = candidate;
    });
  }

  return dist;
};

export const allPairs = (board: Board): Int16Array => {
  const size = cellCount(board);
  const table = new Int16Array(size * size).fill(UNREACHABLE);

  for (let source = 0; source < size; source += 1) {
    table.set(dijkstra(board, source), source * size);
  }

  return table;
};

export const distanceBetween = (dist: Int16Array, size: number, from: Idx, to: Idx) =>
  dist[from * size + to] ?? UNREACHABLE;
