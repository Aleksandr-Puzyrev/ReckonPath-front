import { dailyStandingOf } from "./daily-standing";

const record = (overrides: Partial<Parameters<typeof dailyStandingOf>[0]["record"]> = {}) => ({
  attemptId: "a",
  result: "won" as const,
  movesUsed: 7,
  stars: 3,
  durationMs: 1,
  rank: null,
  percentile: null,
  ranked: null,
  ...overrides,
});

const counted = { isCounted: true, isPending: false, isOnline: true };

describe("dailyStandingOf", () => {
  test("counts the place while the attempt is waiting to be sent", () => {
    expect(dailyStandingOf({ ...counted, record: record(), isPending: true }).place).toEqual({
      kind: "counting",
    });
  });

  test("tells the result will be sent when waiting offline", () => {
    expect(
      dailyStandingOf({ ...counted, record: record(), isPending: true, isOnline: false }),
    ).toEqual({ place: { kind: "unknown" }, note: "offline", topPercent: null });
  });

  test("shows the server's place and the top share", () => {
    expect(dailyStandingOf({ ...counted, record: record({ rank: 134, percentile: 88 }) })).toEqual({
      place: { kind: "rank", rank: 134 },
      note: null,
      topPercent: 12,
    });
  });

  test("marks a continued win that the server left out of the standings (DLY-06)", () => {
    expect(dailyStandingOf({ ...counted, record: record({ ranked: false }) })).toEqual({
      place: { kind: "none" },
      note: "notRanked",
      topPercent: null,
    });
  });

  test("never counts forever once the attempt is sent without a place", () => {
    expect(dailyStandingOf({ ...counted, record: record() }).place).toEqual({ kind: "none" });
  });

  test("gives a replay no place of its own (DLY-04)", () => {
    expect(
      dailyStandingOf({ ...counted, record: record({ rank: 134 }), isCounted: false }),
    ).toEqual({ place: { kind: "none" }, note: "replay", topPercent: null });
  });
});
