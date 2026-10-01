import { createBoard } from "../level/create-board";
import { levelSchema } from "../level/level-schema";
import { validateLevelNorm } from "../solver/norm";
import { validateLevel } from "../validator/validate-level";

import { dailyTier, generateDaily, isWeekend } from "./generate-daily";
import { colGapWall, rowGapWall, streamColumn, streamRow, zigzagWalls } from "./line-helpers";

describe("line helpers", () => {
  test("build a column wall with one gap", () => {
    expect(colGapWall(4, 1, 2)).toEqual([
      [
        [0, 1],
        [0, 2],
      ],
      [
        [1, 1],
        [1, 2],
      ],
      [
        [3, 1],
        [3, 2],
      ],
    ]);
  });

  test("build a row wall with one gap", () => {
    expect(rowGapWall(4, 0, 0)).toEqual([
      [
        [0, 1],
        [1, 1],
      ],
      [
        [0, 2],
        [1, 2],
      ],
      [
        [0, 3],
        [1, 3],
      ],
    ]);
  });

  test("switch columns at the split row in a zigzag", () => {
    expect(zigzagWalls(3, 0, 1, 1)).toEqual([
      [
        [0, 0],
        [0, 1],
      ],
      [
        [1, 1],
        [1, 2],
      ],
      [
        [2, 1],
        [2, 2],
      ],
    ]);
  });

  test("build stream lines", () => {
    expect(streamColumn(1, 3, 2)).toEqual([
      [1, 2],
      [2, 2],
      [3, 2],
    ]);
    expect(streamRow(0, 1, 4)).toEqual([
      [4, 0],
      [4, 1],
    ]);
  });
});

describe("dailyTier", () => {
  test.each([
    ["2026-10-01", 1],
    ["2026-10-07", 1],
    ["2026-10-08", 2],
    ["2026-10-15", 3],
    ["2027-03-01", 20],
    ["2026-09-30", 1],
  ])("%s is tier %i from the default epoch", (dateKey, tier) => {
    expect(dailyTier(dateKey)).toBe(tier);
  });

  test("follows a custom epoch", () => {
    expect(dailyTier("2026-10-01", "2026-09-01")).toBe(5);
  });

  test.each(["2026-13-40", "2026-02-30", "2026-1-5", "today"])(
    "rejects the invalid date %s",
    (dateKey) => {
      expect(() => dailyTier(dateKey)).toThrow(RangeError);
    },
  );
});

describe("isWeekend", () => {
  test.each([
    ["2026-10-01", false],
    ["2026-10-03", true],
    ["2026-10-04", true],
    ["2026-10-05", false],
  ])("%s weekend: %s", (dateKey, expected) => {
    expect(isWeekend(dateKey)).toBe(expected);
  });
});

describe("generateDaily", () => {
  test("is the same level for the same day", () => {
    expect(generateDaily("2026-11-05")).toEqual(generateDaily("2026-11-05"));
  });

  test("produces a valid level with limits from its norm", () => {
    const { level, norm } = generateDaily("2026-12-01");
    const parsed = levelSchema.parse(level);

    expect(validateLevel(parsed, { kind: "daily" })).toEqual([]);
    expect(parsed.id).toBe("d-2026-12-01");
    expect(parsed.moveLimit).toBe(Math.ceil((13 * norm.normSum) / 320));
    expect(parsed.stars).toEqual([
      Math.ceil(norm.normSum / 32),
      Math.ceil((115 * norm.normSum) / 3200),
    ]);
    expect(() => createBoard(parsed)).not.toThrow();
  });

  test.each([
    "2026-10-01",
    "2026-10-03",
    "2026-10-15",
    "2026-10-17",
    "2026-10-29",
    "2026-10-31",
    "2026-11-19",
    "2026-11-21",
    "2026-12-10",
    "2026-12-12",
    "2027-01-07",
    "2027-01-09",
  ])("produces a level on %s that passes both daily validators", (dateKey) => {
    const { level, norm } = generateDaily(dateKey);
    const parsed = levelSchema.parse(level);
    expect(validateLevel(parsed, { kind: "daily" })).toEqual([]);
    expect(validateLevelNorm(parsed, { kind: "daily" }, norm)).toEqual([]);
  });

  test("grows the board and adds a target on weekends", () => {
    const weekday = generateDaily("2026-10-01");
    const saturday = generateDaily("2026-10-03");

    expect(weekday.level.rows).toBe(5);
    expect(saturday.level.rows).toBe(6);
    expect(saturday.level.targets).toHaveLength(weekday.level.targets.length + 1);
  });
});
