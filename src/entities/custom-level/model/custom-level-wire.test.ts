import { emptyDraft } from "./custom-level-of";
import type { CustomDraft } from "./custom-level-type";
import { customLevelRequestOf, savedCustomLevelOf } from "./custom-level-wire";

const DRAFT: CustomDraft = {
  ...emptyDraft("Маяк", 5, 5, "hotcold"),
  map: {
    rows: 5,
    cols: 5,
    targets: [[4, 4]],
    streams: [
      [1, 1],
      [1, 2],
    ],
    bridges: [[1, 2]],
    beacons: [[0, 0]],
  },
};

describe("customLevelRequestOf", () => {
  test("puts the title beside a backend level", () => {
    const request = customLevelRequestOf(DRAFT, null);

    expect(request.title).toBe("Маяк");
    expect(request.level).toEqual({
      rows: 5,
      cols: 5,
      terrain: [".....", ".sb..", ".....", ".....", "....."],
      fences: [],
      beacons: [[0, 0]],
      targets: [[4, 4]],
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

  test("gives a level with a move limit the stars [limit, limit] (decision 0063 #2)", () => {
    const set = customLevelRequestOf({ ...DRAFT, params: { ...DRAFT.params, moveLimit: 9 } }, 4);
    const fromNorm = customLevelRequestOf(DRAFT, 6);

    expect(set.level).toMatchObject({ limit: 9, stars: [9, 9] });
    expect(fromNorm.level).toMatchObject({ limit: 9, stars: [9, 9] });
  });
});

describe("savedCustomLevelOf", () => {
  test("reads the backend level back into the engine model", () => {
    const { level } = customLevelRequestOf(DRAFT, 6);

    expect(
      savedCustomLevelOf({ id: "level-1", title: "", level, updatedAt: "2026-11-22T10:00:00Z" }),
    ).toMatchObject({
      id: "level-1",
      title: "",
      level: { id: "u-level-1", probeMode: "hotcold", moveLimit: 9, bridges: [[1, 2]] },
    });
  });

  test("drops a level the engine schema refuses", () => {
    const { level } = customLevelRequestOf(DRAFT, null);

    expect(
      savedCustomLevelOf({
        id: "level-1",
        title: "",
        level: { ...level, targets: [] },
        updatedAt: "2026-11-22T10:00:00Z",
      }),
    ).toBeNull();
  });
});
