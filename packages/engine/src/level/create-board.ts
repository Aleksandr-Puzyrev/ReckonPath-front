import { edgeKey, isInside, toIdx } from "../grid/grid";
import type { Board, Cell, CellKind, LevelRules } from "../model/types";

import type { LevelInput } from "./level-schema";
import { normalizeLevel } from "./normalize-level";
import type { NormalizedLevel } from "./normalize-level";

const toIndex = (level: NormalizedLevel, cell: Cell) => {
  if (!isInside(level.rows, level.cols, cell)) {
    throw new RangeError(
      `Cell [${cell.join(",")}] is outside the ${level.rows}x${level.cols} board`,
    );
  }
  return toIdx(level.cols, cell);
};

const toIndices = (level: NormalizedLevel, cells: readonly Cell[]) =>
  cells.map((cell) => toIndex(level, cell));

const cellKinds = (level: NormalizedLevel) => {
  const kinds = new Array<CellKind>(level.rows * level.cols).fill("open");
  const marks = [
    [level.streams, "stream"],
    [level.heavy, "heavy"],
    [level.rocks, "rock"],
  ] as const;
  marks.forEach(([cells, kind]) =>
    toIndices(level, cells).forEach((idx) => {
      kinds[idx] = kind;
    }),
  );
  return kinds;
};

export const createBoard = (input: LevelInput): { board: Board; rules: LevelRules } => {
  const level = normalizeLevel(input);

  return {
    board: {
      rows: level.rows,
      cols: level.cols,
      kinds: cellKinds(level),
      bridges: new Set(toIndices(level, level.bridges)),
      fences: new Set(level.fences.map(([a, b]) => edgeKey(toIndex(level, a), toIndex(level, b)))),
      targets: toIndices(level, level.targets),
      bombs: toIndices(level, level.bombs),
      beacons: toIndices(level, level.beacons),
      buoys: toIndices(level, level.buoys),
      targetOrder: level.targetOrder,
    },
    rules: {
      probeMode: level.probeMode,
      moveLimit: level.moveLimit,
      stars: level.stars,
      bombHint: level.bombHint,
      fog: level.fog,
    },
  };
};
