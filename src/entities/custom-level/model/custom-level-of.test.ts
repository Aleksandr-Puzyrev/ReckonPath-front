import { levelSchema } from "@reckon-path/engine";

import { defaultMoveLimit, draftOfLevel, emptyDraft, levelOfDraft } from "./custom-level-of";

describe("custom level conversion", () => {
  test("starts an empty level of the chosen size and hint mode (design 27.4)", () => {
    expect(emptyDraft("Уровень 1", 6, 7, "direction")).toEqual({
      title: "Уровень 1",
      map: { rows: 6, cols: 7, targets: [] },
      params: {
        probeMode: "direction",
        fog: null,
        isTargetOrder: false,
        hasBombHint: true,
        moveLimit: null,
      },
    });
  });

  test("takes the bot estimate + 50 % as the default limit (Part 1 §7.4)", () => {
    expect(defaultMoveLimit(8)).toBe(12);
    const draft = {
      ...emptyDraft("A", 5, 5, "distance"),
      map: { rows: 5, cols: 5, targets: [[2, 2]] as [number, number][] },
    };

    expect(levelOfDraft(draft, null, 8).moveLimit).toBe(12);
  });

  test("builds a valid v2 level and reads it back (decision 0043 #2)", () => {
    const draft = {
      title: "Маяк",
      map: {
        rows: 5,
        cols: 5,
        targets: [[2, 2]] as [number, number][],
        beacons: [[0, 0]] as [number, number][],
      },
      params: {
        probeMode: "hotcold" as const,
        fog: 2,
        isTargetOrder: false,
        hasBombHint: false,
        moveLimit: 9,
      },
    };

    const level = levelOfDraft(draft, "custom-3", 6);

    expect(levelSchema.safeParse(level).success).toBe(true);
    expect(level.id).toBe("u-custom-3");
    expect(draftOfLevel(level)).toMatchObject({
      title: "Маяк",
      params: draft.params,
      map: draft.map,
    });
  });
});
