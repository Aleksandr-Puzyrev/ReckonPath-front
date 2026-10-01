import * as fc from "fast-check";

import type { LevelInput } from "../level/level-schema";
import { makeLevel as level } from "../test-utils/make-level";

import { validateLevel } from "./validate-level";
import type { PvpFormat } from "./validate-level";

const BRONZE: PvpFormat = { size: 5, targets: 1, limits: { bombs: 1 } };

describe("validateLevel", () => {
  test.each(["campaign", "custom", "daily"] as const)(
    "accepts a clean level in the %s context",
    (kind) => {
      expect(validateLevel(level(), { kind })).toEqual([]);
    },
  );

  test("reports exactly the cut-off cells", () => {
    const errors = validateLevel(
      level({
        rocks: [
          [0, 1],
          [1, 0],
        ],
      }),
      { kind: "campaign" },
    );
    expect(errors).toEqual([{ code: "NOT_CONNECTED", cells: [[0, 0]] }]);
  });

  test("reports cells cut off only by fences", () => {
    const fences = [
      [
        [0, 0],
        [0, 1],
      ],
      [
        [0, 0],
        [1, 0],
      ],
    ];
    expect(validateLevel(level({ fences }), { kind: "campaign" })).toEqual([
      { code: "NOT_CONNECTED", cells: [[0, 0]] },
    ]);
  });

  test("applies the stricter PvP bomb limit", () => {
    const errors = validateLevel(
      level({
        bombs: [
          [0, 0],
          [0, 1],
        ],
      }),
      { kind: "pvp", format: BRONZE },
    );
    expect(errors).toEqual([{ code: "TOO_MANY_BOMBS", max: 1 }]);
  });

  test("lists every PvP-only feature that is used", () => {
    const errors = validateLevel(
      level({ targets: [[4, 4]], buoys: [[0, 0]], fog: 3, targetOrder: false }),
      { kind: "pvp", format: BRONZE },
    );
    expect(errors).toEqual([{ code: "FEATURE_IN_PVP", features: ["buoys", "fog"] }]);
  });

  test("allows fog inside 2-4 and no fog", () => {
    [2, 4, null].forEach((fog) => {
      expect(validateLevel(level({ fog }), { kind: "campaign" })).toEqual([]);
    });
  });

  test("reports a duplicated fence edge", () => {
    const edge = [
      [0, 0],
      [0, 1],
    ];
    const errors = validateLevel(
      level({
        fences: [
          edge,
          [
            [0, 1],
            [0, 0],
          ],
        ],
      }),
      { kind: "campaign" },
    );
    expect(errors.map(({ code }) => code)).toEqual(["DUPLICATE"]);
  });

  test.each(["targets", "bombs", "bridges", "beacons", "buoys"] as const)(
    "reports repeated cells in %s even without schema parsing",
    (list) => {
      const repeated: [number, number][] = [
        [2, 2],
        [2, 2],
      ];
      const unparsed: LevelInput = { ...level(), [list]: repeated, streams: [[2, 2]] };
      const duplicate = validateLevel(unparsed, { kind: "custom" }).find(
        ({ code }) => code === "DUPLICATE",
      );
      expect(duplicate).toEqual({ code: "DUPLICATE", cells: [[2, 2]] });
    },
  );

  test.each([0, 6])(
    "reports %s targets outside a PvP format even without schema parsing",
    (count) => {
      const targets: [number, number][] = Array.from({ length: count }, (_, col) => [0, col]);
      const unparsed: LevelInput = { ...level(), targets };
      expect(validateLevel(unparsed, { kind: "custom" })).toContainEqual({
        code: "TARGET_COUNT",
        expected: { min: 1, max: 5 },
        actual: count,
      });
    },
  );

  test("never reports errors for a board without elements", () => {
    fc.assert(
      fc.property(fc.integer({ min: 4, max: 9 }), fc.integer({ min: 4, max: 9 }), (rows, cols) => {
        expect(validateLevel(level({ rows, cols, targets: [[0, 0]] }), { kind: "custom" })).toEqual(
          [],
        );
      }),
    );
  });
});
