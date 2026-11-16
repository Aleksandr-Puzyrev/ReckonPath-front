import { createBoard } from "@reckon-path/engine";

import { gameLevelOfMap, levelOfMap, mapOfLevel } from "./level-of-map";

describe("levelOfMap", () => {
  test("turns an arena map into a level the engine builds", () => {
    const level = levelOfMap({ rows: 5, cols: 6, targets: [[1, 3]], bombs: [[3, 1]] });

    const { board } = createBoard(level);

    expect(level).toEqual(expect.objectContaining({ v: 2, probeMode: "distance", rows: 5 }));
    expect(board.targets).toEqual([9]);
    expect(board.bombs).toEqual([19]);
  });
});

describe("gameLevelOfMap", () => {
  test("writes terrain rows with the bridge over its stream for the backend", () => {
    const level = gameLevelOfMap({
      rows: 2,
      cols: 3,
      targets: [[1, 2]],
      streams: [
        [0, 0],
        [0, 1],
      ],
      bridges: [[0, 1]],
      rocks: [[1, 0]],
    });

    expect(level).toEqual(
      expect.objectContaining({
        terrain: ["sb.", "r.."],
        targets: [[1, 2]],
        mode: "number",
        limit: 0,
      }),
    );
  });

  test("reads the map back from the backend level", () => {
    const map = {
      rows: 4,
      cols: 4,
      targets: [[3, 3]] as [number, number][],
      bombs: [[0, 3]] as [number, number][],
      streams: [[1, 1]] as [number, number][],
      bridges: [],
      heavy: [[2, 2]] as [number, number][],
      rocks: [],
      fences: [
        [
          [0, 0],
          [0, 1],
        ],
      ] as [[number, number], [number, number]][],
    };

    expect(mapOfLevel(gameLevelOfMap(map))).toEqual(map);
  });
});
