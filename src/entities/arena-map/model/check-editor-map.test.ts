import type { MatchFormat, PvpMap } from "./arena-map-type";
import { checkEditorMap } from "./check-editor-map";

const FORMAT: MatchFormat = {
  rows: 5,
  cols: 6,
  targets: 1,
  moveSeconds: 10,
  league: "bronze",
  leagueTitle: "Bronze",
  caps: { fences: 3, stream: 3, heavy: 1, rock: 2, bridge: 1, bombs: 2 },
};

const VALID: PvpMap = {
  rows: 5,
  cols: 6,
  targets: [[2, 2]],
  bombs: [
    [0, 0],
    [4, 4],
  ],
  streams: [
    [1, 2],
    [2, 1],
    [3, 2],
  ],
};

describe("checkEditorMap", () => {
  test("accepts a rectangular map of the format", () => {
    expect(checkEditorMap(VALID, FORMAT)).toEqual({ kind: "valid" });
  });

  test("refuses a map of another size", () => {
    expect(checkEditorMap({ ...VALID, cols: 5 }, FORMAT).kind).toBe("invalid");
  });

  test("asks for exactly the format's targets", () => {
    expect(
      checkEditorMap(
        {
          ...VALID,
          targets: [
            [2, 2],
            [4, 0],
          ],
        },
        FORMAT,
      ),
    ).toEqual({ kind: "targets", count: 1 });
  });

  test("names the tiles cut off by fences", () => {
    const map: PvpMap = {
      ...VALID,
      fences: [
        [
          [0, 5],
          [0, 4],
        ],
        [
          [0, 5],
          [1, 5],
        ],
      ],
    };

    expect(checkEditorMap(map, FORMAT)).toEqual({ kind: "isolated", cells: [[0, 5]] });
  });

  test("stops at the format's bomb cap", () => {
    const map: PvpMap = {
      ...VALID,
      bombs: [
        [0, 0],
        [4, 4],
        [0, 4],
      ],
    };

    expect(checkEditorMap(map, FORMAT)).toEqual(expect.objectContaining({ kind: "limit", max: 2 }));
  });

  test("does not count a bridge as a stream against the stream cap", () => {
    const map: PvpMap = {
      ...VALID,
      streams: [
        [3, 1],
        [3, 2],
        [3, 3],
        [3, 4],
      ],
      bridges: [[3, 2]],
    };

    expect(checkEditorMap(map, FORMAT)).toEqual({ kind: "valid" });
  });

  test("wants water next to a bridge, as the backend does", () => {
    const map: PvpMap = { ...VALID, streams: [[1, 2]], bridges: [[1, 2]] };

    expect(checkEditorMap(map, FORMAT)).toEqual({ kind: "bridge", cells: [[1, 2]] });
  });
});
