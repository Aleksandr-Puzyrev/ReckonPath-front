import { formatClockTime } from "./format-clock-time";

describe("formatClockTime", () => {
  test("shows the local hours and minutes", () => {
    const until = new Date(2026, 8, 26, 15, 30).toISOString();

    expect(formatClockTime(until, "ru")).toBe("15:30");
  });
});
