import { levelFromBackend, toIdx } from "@reckon-path/engine";
import type { Idx, LevelInput } from "@reckon-path/engine";

import type { ArenaCellView, BoardView, Cell } from "./match-type";

export interface ArenaTap {
  cell: Idx;
  outcome: "pelang" | "target" | "bomb";
  value: number | null;
  bombNear: boolean;
}

const BOARD_ID = "u-arena-match";

const pointOf = ([row = 0, col = 0]: readonly number[]): Cell => [row, col];

// Without secrets the board has only the terrain and fences: the rival's targets stay on the server until the end (без secrets на поле только рельеф и заборы: цели соперника остаются на сервере до конца).
export const levelOfBoard = (board: BoardView): LevelInput =>
  levelFromBackend(
    {
      rows: board.rows,
      cols: board.cols,
      terrain: board.terrain,
      fences: board.fences.map(([from = [], to = []]): [Cell, Cell] => [
        pointOf(from),
        pointOf(to),
      ]),
      targets: (board.secrets?.targets ?? []).map(pointOf),
      bombs: (board.secrets?.bombs ?? []).map(pointOf),
      mode: "number",
      limit: 0,
      stars: [0, 0],
    },
    BOARD_ID,
  );

const outcomeOf = ({ kind }: ArenaCellView): ArenaTap["outcome"] => {
  if (kind === "target") return "target";
  if (kind === "bomb") return "bomb";
  return "pelang";
};

export const tapsOfBoard = ({ cols, revealed }: BoardView): ArenaTap[] =>
  revealed.map((cell) => ({
    cell: toIdx(cols, [cell.row, cell.col]),
    outcome: outcomeOf(cell),
    value: cell.kind === "number" ? (cell.value ?? null) : null,
    bombNear: cell.nearBomb === true,
  }));

export const tapIdxOfBoard = ({ cols, taps }: BoardView): Idx[] =>
  taps.map((cell) => toIdx(cols, pointOf(cell)));
