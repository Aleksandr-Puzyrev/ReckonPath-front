import { streakSummaryOf } from "./streak-summary";
import type { StreakView } from "./streak-types";

const MILESTONES = [
  { days: 3, gems: 5, reached: true },
  { days: 7, gems: 15, reached: false },
];

const viewOf = (overrides: Partial<StreakView>): StreakView => ({
  current: 0,
  best: 0,
  todayDone: false,
  restorable: false,
  restoreCost: 30,
  milestones: MILESTONES,
  ...overrides,
});

describe("streakSummaryOf", () => {
  test("takes the live streak and the milestones from the server", () => {
    expect(streakSummaryOf(viewOf({ current: 6, best: 12, lastDay: "2026-09-27" }))).toEqual({
      current: 6,
      best: 12,
      lost: null,
      milestones: MILESTONES,
    });
  });

  test("shows a streak a missed day broke as lost, keeping the best (DLY-11)", () => {
    expect(streakSummaryOf(viewOf({ broken: 12, best: 19, restorable: true }))).toMatchObject({
      current: 0,
      best: 19,
      lost: 12,
    });
  });

  test("starts from nothing before the first answer", () => {
    expect(streakSummaryOf(undefined)).toEqual({ current: 0, best: 0, lost: null, milestones: [] });
  });
});
