import { dayResultOf, todayOf } from "./day-result";
import type { DailyDay } from "./daily-types";

const DAY: DailyDay = {
  date: "2026-09-28",
  today: true,
  players: 1240,
  nextDayAt: "2026-09-29T00:00:00Z",
};

describe("dayResultOf", () => {
  test("has no result before the day is won", () => {
    expect(dayResultOf({ ...DAY, gameId: "game-1", status: "lost", attempts: 2 })).toBeNull();
    expect(dayResultOf(undefined)).toBeNull();
  });

  test("takes the won result and the place among the players who won (decision 0061 #6)", () => {
    expect(
      dayResultOf({ ...DAY, mine: { rank: 4, stars: 3, moves: 8, attempts: 1 }, status: "won" }),
    ).toEqual({ stars: 3, moves: 8, place: { rank: 4, total: 1240 } });
  });

  test("keeps the result without a place when the server sends no rank", () => {
    expect(dayResultOf({ ...DAY, mine: { stars: 2, moves: 9, attempts: 3 } })?.place).toBeNull();
  });
});

describe("todayOf", () => {
  test("keeps only the day of today's date", () => {
    expect(todayOf(DAY, "2026-09-28")).toBe(DAY);
    expect(todayOf(DAY, "2026-09-29")).toBeUndefined();
    expect(todayOf(undefined, "2026-09-28")).toBeUndefined();
  });
});
