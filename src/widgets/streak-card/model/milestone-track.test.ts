import { STREAK_MILESTONES } from "@entities/streak";

import { milestoneStatesOf, trackShareOf } from "./milestone-track";

describe("trackShareOf", () => {
  test("is empty before the first milestone and full after the last", () => {
    expect(trackShareOf(2, STREAK_MILESTONES)).toBe(0);
    expect(trackShareOf(30, STREAK_MILESTONES)).toBe(1);
  });

  test("fills each gap between milestones evenly", () => {
    expect(trackShareOf(7, STREAK_MILESTONES)).toBeCloseTo(1 / 3);
    expect(trackShareOf(10, STREAK_MILESTONES)).toBeCloseTo(1 / 3 + 3 / 7 / 3);
  });
});

describe("milestoneStatesOf", () => {
  test("marks reached milestones and highlights the next one", () => {
    expect(milestoneStatesOf(12, STREAK_MILESTONES)).toEqual([
      "reached",
      "reached",
      "next",
      "ahead",
    ]);
  });
});
