import { levelFromBackend, levelToBackend } from "./backend-level";
import type { BackendLevel } from "./backend-level";
import { levelSchema } from "./level-schema";

const BACKEND: BackendLevel = {
  rows: 4,
  cols: 5,
  terrain: ["..s..", ".bsh.", "r....", "....."],
  fences: [
    [
      [0, 0],
      [0, 1],
    ],
  ],
  beacons: [[2, 3]],
  targets: [[0, 3]],
  bombs: [[2, 2]],
  buoys: [[2, 1]],
  mode: "course",
  fog: 2,
  order: true,
  noBombHint: true,
  limit: 12,
  stars: [6, 9],
};

describe("levelFromBackend", () => {
  test("lays a bridge over a stream and keeps a rectangular board", () => {
    const level = levelFromBackend(BACKEND, "c-7");

    expect(levelSchema.parse(level)).toEqual(level);
    expect(level).toMatchObject({ rows: 4, cols: 5, probeMode: "direction" });
    expect(level.streams).toEqual([
      [0, 2],
      [1, 1],
      [1, 2],
    ]);
    expect(level.bridges).toEqual([[1, 1]]);
    expect(level.heavy).toEqual([[1, 3]]);
    expect(level.rocks).toEqual([[2, 0]]);
  });

  test("maps the backend rules onto the engine ones", () => {
    expect(levelFromBackend(BACKEND, "c-7")).toMatchObject({
      fog: 2,
      targetOrder: true,
      bombHint: false,
      moveLimit: 12,
      stars: [6, 9],
    });
  });

  test("reads a zero limit as a level without limit and stars", () => {
    const level = levelFromBackend(
      { ...BACKEND, mode: "number", fog: 0, limit: 0, stars: [0, 0], noBombHint: undefined },
      "c-1",
    );

    expect(level).toMatchObject({
      probeMode: "distance",
      fog: null,
      moveLimit: null,
      stars: null,
      bombHint: true,
    });
  });
});

describe("levelToBackend", () => {
  test("returns the backend level it was read from", () => {
    expect(levelToBackend(levelFromBackend(BACKEND, "u-map"))).toEqual(BACKEND);
  });

  test("writes the hot-cold mode and the defaults of a bare level", () => {
    const level = levelToBackend({
      v: 2,
      id: "u-map",
      rows: 4,
      cols: 4,
      targets: [[1, 1]],
      probeMode: "hotcold",
    });

    expect(level).toEqual({
      rows: 4,
      cols: 4,
      terrain: ["....", "....", "....", "...."],
      fences: [],
      beacons: [],
      targets: [[1, 1]],
      bombs: [],
      buoys: [],
      mode: "hot_cold",
      fog: 0,
      order: false,
      noBombHint: false,
      limit: 0,
      stars: [0, 0],
    });
  });
});
