import type { LevelInput } from "@reckon-path/engine";

import { levelElements, publicBoardElements } from "./describe-level";

const LEVEL: LevelInput = {
  v: 2,
  id: "c-describe",
  rows: 7,
  cols: 7,
  targets: [
    [0, 0],
    [6, 6],
  ],
  bombs: [[3, 3]],
  bridges: [
    [1, 1],
    [2, 1],
  ],
  streams: [
    [1, 1],
    [2, 1],
  ],
  probeMode: "distance",
};

describe("levelElements", () => {
  test("counts only the elements a level has", () => {
    expect(levelElements(LEVEL)).toEqual([
      { element: "bombs", count: 1 },
      { element: "streams", count: 2 },
      { element: "bridges", count: 2 },
    ]);
  });
});

describe("publicBoardElements", () => {
  test("counts the terrain and the hidden elements the server reports", () => {
    expect(
      publicBoardElements({
        rows: 2,
        cols: 3,
        terrain: ["sbh", "r.s"],
        fences: [
          [
            [0, 0],
            [1, 0],
          ],
        ],
        beacons: [],
        mode: "number",
        fog: 0,
        order: false,
        limit: 6,
        stars: [3, 4],
        targets: 1,
        bombs: 2,
        buoys: 1,
      }),
    ).toEqual([
      { element: "bombs", count: 2 },
      { element: "streams", count: 3 },
      { element: "bridges", count: 1 },
      { element: "heavy", count: 1 },
      { element: "rocks", count: 1 },
      { element: "fences", count: 1 },
      { element: "buoys", count: 1 },
    ]);
  });
});
