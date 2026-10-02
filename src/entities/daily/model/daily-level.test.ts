import { dailyLevelOf } from "./daily-level";

const OVERRIDE = {
  v: 2,
  id: "holiday",
  rows: 4,
  cols: 4,
  targets: [[1, 1]],
  probeMode: "distance",
  moveLimit: 5,
  stars: [2, 3],
};

describe("dailyLevelOf", () => {
  test("gives every player the same level for the date (DLY-01)", () => {
    expect(dailyLevelOf("2026-10-02", null)).toEqual(dailyLevelOf("2026-10-02", null));
  });

  test("names the level after its day", () => {
    expect(dailyLevelOf("2026-10-02", null).id).toBe("d-2026-10-02");
  });

  test("plays the admin's override instead of the generated level (DLY-13)", () => {
    expect(dailyLevelOf("2026-10-02", OVERRIDE)).toMatchObject({
      id: "d-2026-10-02",
      rows: 4,
      targets: [[1, 1]],
    });
  });

  test("falls back to the generated level when the override is broken", () => {
    expect(dailyLevelOf("2026-10-02", { rows: "big" })).toEqual(dailyLevelOf("2026-10-02", null));
  });
});
