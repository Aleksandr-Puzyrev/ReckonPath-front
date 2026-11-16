import { createBoard } from "@reckon-path/engine";

import { playingMatchMock } from "@shared/test-utils/api-mock";

import { levelOfBoard, tapIdxOfBoard, tapsOfBoard } from "./board-of";
import type { BoardView } from "./match-type";

const board = (): BoardView => {
  const rivalMap = playingMatchMock().rivalMap;
  if (rivalMap === undefined) throw new Error("No rival map");
  return {
    ...rivalMap,
    revealed: [
      { row: 0, col: 1, kind: "number", value: 3, tone: "warm", epoch: 0, nearBomb: true },
      { row: 4, col: 4, kind: "target", epoch: 0 },
      { row: 1, col: 4, kind: "bomb", epoch: 0 },
    ],
    taps: [
      [0, 1],
      [4, 4],
      [1, 4],
    ],
  };
};

describe("arena boards", () => {
  test("builds the rival board from the terrain without its secrets", () => {
    const { board: built } = createBoard(levelOfBoard(board()));

    expect(built.targets).toEqual([]);
    expect(built.rows).toBe(6);
  });

  test("turns the revealed cells into taps on the board", () => {
    expect(tapsOfBoard(board())).toEqual([
      { cell: 1, outcome: "pelang", value: 3, bombNear: true },
      { cell: 28, outcome: "target", value: null, bombNear: false },
      { cell: 10, outcome: "bomb", value: null, bombNear: false },
    ]);
    expect(tapIdxOfBoard(board())).toEqual([1, 28, 10]);
  });

  test("shows the targets once the secrets arrive", () => {
    const open = { ...board(), secrets: { targets: [[4, 4]], bombs: [[1, 4]], buoys: [] } };

    expect(createBoard(levelOfBoard(open)).board.targets).toEqual([28]);
  });
});
