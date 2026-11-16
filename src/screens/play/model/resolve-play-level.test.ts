import { resolveDailyLevel } from "./resolve-play-level";

const NOW = Date.UTC(2026, 9, 2, 12);

const context = (overrides: Partial<Parameters<typeof resolveDailyLevel>[1]> = {}) => ({
  isUnlocked: true,
  now: NOW,
  savedLevelId: null,
  dailyOverride: () => null,
  ...overrides,
});

describe("resolveDailyLevel", () => {
  test("opens today's daily", () => {
    expect(resolveDailyLevel("d-2026-10-02", context())).toMatchObject({
      kind: "daily",
      dayKey: "2026-10-02",
      level: { id: "d-2026-10-02" },
    });
  });

  test("does not open another day's daily", () => {
    expect(resolveDailyLevel("d-2026-10-01", context()).kind).toBe("missing");
  });

  test("lets a game started yesterday be finished (DLY-03)", () => {
    expect(resolveDailyLevel("d-2026-10-01", context({ savedLevelId: "d-2026-10-01" })).kind).toBe(
      "daily",
    );
  });

  test("keeps the daily closed until the server opens it", () => {
    expect(resolveDailyLevel("d-2026-10-02", context({ isUnlocked: false })).kind).toBe(
      "dailyLocked",
    );
  });

  test("knows nothing of ids that are not a daily", () => {
    expect(resolveDailyLevel("e-1", context()).kind).toBe("missing");
  });
});
