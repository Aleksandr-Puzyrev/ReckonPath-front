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
});
