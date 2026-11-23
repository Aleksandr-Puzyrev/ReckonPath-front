import { checkCustomLevel } from "./check-custom-level";
import { emptyDraft } from "./custom-level-of";
import type { CustomMap } from "./custom-level-type";

const draftWith = (map: Partial<CustomMap>) => {
  const draft = emptyDraft("A", 5, 5, "distance");
  return { ...draft, map: { ...draft.map, ...map } };
};

describe("checkCustomLevel", () => {
  test("asks for a target on an empty level", () => {
    expect(checkCustomLevel(draftWith({}), null)).toEqual({ kind: "targets", count: 1 });
  });

  test("gives the bot estimate of a valid level", () => {
    const status = checkCustomLevel(draftWith({ targets: [[4, 4]] }), null);

    expect(status.kind).toBe("valid");
    expect(status.kind === "valid" ? status.norm : 0).toBeGreaterThan(0);
  });

  test("points at a beacon placed on a target (Part 6 validator)", () => {
    const status = checkCustomLevel(draftWith({ targets: [[2, 2]], beacons: [[2, 2]] }), null);

    expect(status).toEqual({ kind: "invalid", cells: [[2, 2]] });
  });

  test("keeps the bomb limit of Part 1 §2.5", () => {
    const status = checkCustomLevel(
      draftWith({
        targets: [[4, 4]],
        bombs: [
          [0, 0],
          [0, 1],
          [0, 2],
        ],
      }),
      null,
    );

    expect(status).toMatchObject({ kind: "limit", max: 2 });
  });

  test("keeps the backend editor caps (decision 0063 #3)", () => {
    const streams = Array.from({ length: 13 }, (_, index): [number, number] => [
      Math.floor(index / 5),
      index % 5,
    ]);

    expect(checkCustomLevel(draftWith({ targets: [[4, 4]], streams }), null)).toEqual({
      kind: "limit",
      max: 12,
      cells: [],
    });
  });

  test("counts a bridge apart from the water", () => {
    const streams = Array.from({ length: 13 }, (_, index): [number, number] => [
      Math.floor(index / 5),
      index % 5,
    ]);

    const status = checkCustomLevel(
      draftWith({ targets: [[4, 4]], streams, bridges: [[0, 1]] }),
      null,
    );

    expect(status.kind).toBe("valid");
  });

  test("wants water next to a bridge (decision 0063 #4)", () => {
    const status = checkCustomLevel(
      draftWith({ targets: [[4, 4]], streams: [[2, 2]], bridges: [[2, 2]] }),
      null,
    );

    expect(status).toEqual({ kind: "bridge", cells: [[2, 2]] });
  });

  test("keeps the beacon limit", () => {
    const status = checkCustomLevel(
      draftWith({
        targets: [[4, 4]],
        beacons: [
          [0, 0],
          [0, 1],
          [0, 2],
          [0, 3],
        ],
      }),
      null,
    );

    expect(status).toEqual({ kind: "limit", max: 3, cells: [] });
  });

  test("flags a move limit over 99", () => {
    const draft = draftWith({ targets: [[4, 4]] });

    expect(
      checkCustomLevel({ ...draft, params: { ...draft.params, moveLimit: 100 } }, null),
    ).toEqual({ kind: "limit", max: 99, cells: [] });
  });
});
