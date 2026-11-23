import { i18n } from "@shared/i18n";

import { lockReasonOf } from "./lock-reason-of";

describe("lockReasonOf", () => {
  beforeAll(() => i18n.changeLanguage("ru"));

  test("names the ban first, then the unlock level (decision 0062 #22)", () => {
    expect(lockReasonOf({ isUnlocked: true, unlockLevel: 12, isBanned: true }, i18n.t)).toBe(
      "Арена для тебя закрыта",
    );
    expect(lockReasonOf({ isUnlocked: false, unlockLevel: 12, isBanned: false }, i18n.t)).toBe(
      "Арена откроется после уровня 12",
    );
  });

  test("gives no reason for an open arena", () => {
    expect(lockReasonOf({ isUnlocked: true, unlockLevel: 12, isBanned: false }, i18n.t)).toBeNull();
  });
});
