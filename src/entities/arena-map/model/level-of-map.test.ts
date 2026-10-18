import { createBoard } from "@reckon-path/engine";

import { levelOfMap } from "./level-of-map";

describe("levelOfMap", () => {
  test("turns an arena map into a level the engine builds", () => {
    const level = levelOfMap({
      rows: 5,
      cols: 5,
      targets: [[1, 3]],
      bombs: [[3, 1]],
      fences: [
        [
          [0, 0],
          [0, 1],
        ],
      ],
    });

    const { board } = createBoard(level);

    expect(level).toEqual(expect.objectContaining({ v: 2, probeMode: "distance", rows: 5 }));
    expect(board.targets).toEqual([8]);
    expect(board.bombs).toEqual([16]);
  });
});
