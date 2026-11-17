import type { StreakView } from "@entities/streak";

import { isRestoreFirst } from "./restore-first";

const streak = (overrides: Partial<StreakView> = {}): StreakView => ({
  current: 0,
  best: 19,
  todayDone: false,
  broken: 12,
  restorable: true,
  restoreCost: 30,
  milestones: [],
  ...overrides,
});

describe("isRestoreFirst", () => {
  test("warns before the start while the broken streak can be restored (decision 0061 #9)", () => {
    expect(isRestoreFirst(streak())).toBe(true);
  });

  test("lets the day start at once when nothing can be restored", () => {
    expect(isRestoreFirst(streak({ restorable: false }))).toBe(false);
    expect(isRestoreFirst(streak({ broken: undefined, restorable: false, current: 5 }))).toBe(
      false,
    );
    expect(isRestoreFirst(undefined)).toBe(false);
  });

  test("does not warn once today is won", () => {
    expect(isRestoreFirst(streak({ todayDone: true }))).toBe(false);
  });
});
