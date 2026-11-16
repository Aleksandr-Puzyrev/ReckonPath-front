import { levelOfPublicBoard } from "./public-board-level";
import type { PublicBoard } from "./campaign-types";

const BOARD: PublicBoard = {
  rows: 3,
  cols: 4,
  terrain: ["..s.", "h.b.", "...r"],
  fences: [
    [
      [0, 0],
      [1, 0],
    ],
  ],
  beacons: [[2, 0]],
  mode: "course",
  fog: 2,
  order: true,
  limit: 0,
  stars: [0, 0],
  targets: 2,
  bombs: 1,
  buoys: 0,
};

describe("levelOfPublicBoard", () => {
  test("builds a rectangular engine level with no hidden cells (decision 0060 #15)", () => {
    expect(levelOfPublicBoard(BOARD, "campaign-7")).toMatchObject({
      id: "campaign-7",
      rows: 3,
      cols: 4,
      targets: [],
      bombs: [],
      streams: [
        [0, 2],
        [1, 2],
      ],
      bridges: [[1, 2]],
      heavy: [[1, 0]],
      rocks: [[2, 3]],
      beacons: [[2, 0]],
      probeMode: "direction",
      fog: 2,
      targetOrder: true,
      moveLimit: null,
      stars: null,
    });
  });

  test("adds the secrets once the server shows them", () => {
    const level = levelOfPublicBoard(BOARD, "campaign-7", {
      targets: [[0, 1]],
      bombs: [[2, 2]],
      buoys: [],
    });

    expect(level).toMatchObject({ targets: [[0, 1]], bombs: [[2, 2]] });
  });
});
