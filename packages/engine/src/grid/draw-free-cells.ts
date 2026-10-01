import type { Point } from "../model/types";
import { randInt } from "../random/random";
import type { Rng } from "../random/random";

import { cellKey, toCell } from "./grid";

export const FREE_CELL_DRAWS = 300;

export const drawRandomCell = (rng: Rng, size: number): Point => {
  const [row, col] = toCell(size, randInt(rng, 0, size * size - 1));
  return [row, col];
};

export const drawFreeCells = (
  rng: Rng,
  size: number,
  count: number,
  isEligible: (cell: Point) => boolean,
) => {
  const chosen: Point[] = [];
  const chosenKeys = new Set<string>();
  for (let draw = 0; draw < FREE_CELL_DRAWS && chosen.length < count; draw += 1) {
    const cell = drawRandomCell(rng, size);
    if (!isEligible(cell) || chosenKeys.has(cellKey(cell))) continue;
    chosen.push(cell);
    chosenKeys.add(cellKey(cell));
  }
  return chosen;
};
