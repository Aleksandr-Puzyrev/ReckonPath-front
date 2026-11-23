import { applyCellEdit } from "./apply-edit";

const MAP = { rows: 5, cols: 5, targets: [], beacons: [[1, 1]] as [number, number][] };

describe("applyCellEdit", () => {
  test("keeps beacons through arena edits", () => {
    expect(applyCellEdit(MAP, "stream", [0, 0], true)).toMatchObject({
      map: { beacons: [[1, 1]], streams: [[0, 0]] },
    });
  });

  test("places beacons by a tap, not by a drag", () => {
    expect(applyCellEdit(MAP, "beacon", [2, 2], false)).toEqual({ map: MAP });
    expect(applyCellEdit(MAP, "beacon", [2, 2], true)).toEqual({
      map: {
        ...MAP,
        beacons: [
          [1, 1],
          [2, 2],
        ],
      },
    });
  });

  test("erases a beacon with its tile", () => {
    expect(applyCellEdit(MAP, "erase", [1, 1], true)).toMatchObject({ map: { beacons: [] } });
  });

  test("stops at the backend stream cap (decision 0063 #3)", () => {
    const streams = Array.from({ length: 12 }, (_, index): [number, number] => [
      Math.floor(index / 5),
      index % 5,
    ]);

    expect(applyCellEdit({ ...MAP, streams }, "stream", [4, 4], true)).toEqual({
      refusal: { kind: "limit", max: 12 },
    });
  });
});
