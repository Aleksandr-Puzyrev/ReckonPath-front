import { createBoard } from "@reckon-path/engine";

import { layoutLevelOf } from "./layout-level-of";

describe("layoutLevelOf", () => {
  test("builds the opponent's board from the layout and the format size", () => {
    const { board } = createBoard(layoutLevelOf({ rocks: [[1, 1]], streams: [[2, 2]] }, 5));

    expect(board.rows).toBe(5);
    expect(board.kinds[6]).toBe("rock");
    expect(board.targets).toEqual([]);
  });
});
