import type { StreakView } from "@entities/streak";

import { restoreOfferOf } from "./restore-offer";

const streak = (overrides: Partial<StreakView> = {}): StreakView => ({
  current: 0,
  best: 19,
  lastDay: "2026-09-26",
  todayDone: false,
  broken: 12,
  restorable: true,
  restoreCost: 30,
  milestones: [],
  ...overrides,
});

describe("restoreOfferOf", () => {
  test("offers to restore a streak broken yesterday for its price (DLY-09)", () => {
    expect(restoreOfferOf(streak())).toEqual({ kind: "restorable", lost: 12, price: 30 });
  });

  test("explains the weekly limit when the restore was already used (DLY-10)", () => {
    expect(
      restoreOfferOf(streak({ restorable: false, restoreAt: "2026-10-01T10:00:00Z" })),
    ).toEqual({ kind: "weekly", lost: 12 });
  });

  test("offers nothing for a streak that is alive, empty or lost for good (DLY-11)", () => {
    expect(restoreOfferOf(streak({ broken: undefined, current: 6, restorable: false }))).toBeNull();
    expect(restoreOfferOf(streak({ broken: 0 }))).toBeNull();
    expect(restoreOfferOf(undefined)).toBeNull();
  });
});
