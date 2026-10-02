import { streakForecastOf } from "./streak-forecast";

const DAYS = { todayKey: "2026-09-28", yesterdayKey: "2026-09-27" };

const streak = (current: number, lastDay: string, best = 19) => ({
  current,
  best,
  lastDay,
  restorable: false,
});

describe("streakForecastOf", () => {
  test("adds today's counted attempt before the server knows it", () => {
    expect(streakForecastOf(streak(12, "2026-09-27"), { ...DAYS, hasCountedToday: true })).toEqual({
      current: 13,
      best: 19,
      lost: null,
    });
  });

  test("does not add today twice once the server counted it", () => {
    expect(
      streakForecastOf(streak(13, "2026-09-28"), { ...DAYS, hasCountedToday: true }).current,
    ).toBe(13);
  });

  test("shows a streak broken by a missed day, keeping the best (DLY-11)", () => {
    expect(streakForecastOf(streak(12, "2026-09-25"), { ...DAYS, hasCountedToday: false })).toEqual(
      {
        current: 0,
        best: 19,
        lost: 12,
      },
    );
  });

  test("starts again from one after a missed day (DLY-10)", () => {
    expect(
      streakForecastOf(streak(12, "2026-09-25"), { ...DAYS, hasCountedToday: true }).current,
    ).toBe(1);
  });

  test("counts from zero before the first answer", () => {
    expect(streakForecastOf(undefined, { ...DAYS, hasCountedToday: true })).toEqual({
      current: 1,
      best: 1,
      lost: null,
    });
  });
});
