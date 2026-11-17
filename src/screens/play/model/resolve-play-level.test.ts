import { resolveDailyRoute } from "./resolve-play-level";

const context = (overrides: Partial<Parameters<typeof resolveDailyRoute>[1]> = {}) => ({
  isUnlocked: true,
  todayKey: "2026-10-02",
  ...overrides,
});

describe("resolveDailyRoute", () => {
  test("opens today's daily", () => {
    expect(resolveDailyRoute("d-2026-10-02", context())).toEqual({
      kind: "daily",
      dayKey: "2026-10-02",
    });
  });

  test("ends another day's daily (decision 0061 #11)", () => {
    expect(resolveDailyRoute("d-2026-10-01", context()).kind).toBe("dayOver");
  });

  test("keeps the daily closed until the server opens it", () => {
    expect(resolveDailyRoute("d-2026-10-02", context({ isUnlocked: false })).kind).toBe(
      "dailyLocked",
    );
  });

  test("knows nothing of ids that are not a daily", () => {
    expect(resolveDailyRoute("e-1", context()).kind).toBe("missing");
  });
});
