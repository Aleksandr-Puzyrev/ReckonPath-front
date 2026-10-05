import { restoreOfferOf } from "./restore-offer";

const DAY_BEFORE_YESTERDAY = "2026-09-26";

const streak = (overrides = {}) => ({
  current: 12,
  best: 19,
  lastDay: DAY_BEFORE_YESTERDAY,
  restorable: true,
  restoreUntil: "2026-09-29T00:00:00Z",
  price: 30,
  ...overrides,
});

describe("restoreOfferOf", () => {
  test("offers to restore a streak broken yesterday (DLY-09)", () => {
    expect(restoreOfferOf(streak(), DAY_BEFORE_YESTERDAY)).toEqual({
      kind: "restorable",
      lost: 12,
      price: 30,
      restoreUntil: "2026-09-29T00:00:00Z",
    });
  });

  test("explains the weekly limit when the restore was already used (DLY-10)", () => {
    expect(restoreOfferOf(streak({ restorable: false }), DAY_BEFORE_YESTERDAY)).toEqual({
      kind: "weekly",
      lost: 12,
    });
  });

  test("offers nothing after two missed days (DLY-11)", () => {
    expect(restoreOfferOf(streak({ lastDay: "2026-09-25" }), DAY_BEFORE_YESTERDAY)).toBeNull();
  });

  test("offers nothing for a streak that is alive or empty", () => {
    expect(restoreOfferOf(streak({ lastDay: "2026-09-27" }), DAY_BEFORE_YESTERDAY)).toBeNull();
    expect(restoreOfferOf(streak({ current: 0 }), DAY_BEFORE_YESTERDAY)).toBeNull();
    expect(restoreOfferOf(undefined, DAY_BEFORE_YESTERDAY)).toBeNull();
  });
});
