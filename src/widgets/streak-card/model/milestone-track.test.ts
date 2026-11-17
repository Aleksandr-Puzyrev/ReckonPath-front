import type { StreakMilestone } from "@entities/streak";

import { milestoneStatesOf, trackShareOf } from "./milestone-track";

const milestonesAt = (days: number): StreakMilestone[] =>
  [
    { days: 3, gems: 5 },
    { days: 7, gems: 15 },
    { days: 14, gems: 30 },
    { days: 30, gems: 60 },
  ].map((milestone) => ({ ...milestone, reached: days >= milestone.days }));

describe("trackShareOf", () => {
  test("is empty before the first milestone and full after the last", () => {
    expect(trackShareOf(2, milestonesAt(2))).toBe(0);
    expect(trackShareOf(30, milestonesAt(30))).toBe(1);
  });

  test("fills each gap between milestones evenly", () => {
    expect(trackShareOf(7, milestonesAt(7))).toBeCloseTo(1 / 3);
    expect(trackShareOf(10, milestonesAt(10))).toBeCloseTo(1 / 3 + 3 / 7 / 3);
  });
});

describe("milestoneStatesOf", () => {
  test("marks the milestones the server says are reached and highlights the next one", () => {
    expect(milestoneStatesOf(milestonesAt(12))).toEqual(["reached", "reached", "next", "ahead"]);
  });
});
