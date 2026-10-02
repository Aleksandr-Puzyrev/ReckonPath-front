import { dailyLevelId, dayKeyAfter, dayKeyOf, dayKeyOfLevelId, nextDayStartOf } from "./day-key";

describe("dayKeyOf", () => {
  test("follows UTC, not the phone's zone (DLY-02)", () => {
    expect(dayKeyOf(Date.UTC(2026, 8, 26, 23, 59, 59))).toBe("2026-09-26");
    expect(dayKeyOf(Date.UTC(2026, 8, 27, 0, 0, 0))).toBe("2026-09-27");
  });
});

describe("nextDayStartOf", () => {
  test("is the next UTC midnight", () => {
    expect(nextDayStartOf(Date.UTC(2026, 8, 26, 21, 0))).toBe(Date.UTC(2026, 8, 27));
  });
});

describe("dayKeyAfter", () => {
  test("moves by whole days across months", () => {
    expect(dayKeyAfter("2026-09-30", 1)).toBe("2026-10-01");
    expect(dayKeyAfter("2026-10-01", -1)).toBe("2026-09-30");
  });
});

describe("daily level ids", () => {
  test("round-trip a day key", () => {
    expect(dayKeyOfLevelId(dailyLevelId("2026-09-26"))).toBe("2026-09-26");
  });

  test("reject anything that is not a real day", () => {
    expect(dayKeyOfLevelId("c-1")).toBeNull();
    expect(dayKeyOfLevelId("d-2026-13-40")).toBeNull();
    expect(dayKeyOfLevelId("d-tomorrow")).toBeNull();
  });
});
