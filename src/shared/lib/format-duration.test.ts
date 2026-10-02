import { formatCountdown, formatDuration } from "./format-duration";

describe("formatDuration", () => {
  test("shows minutes and seconds", () => {
    expect(formatDuration(84_000)).toBe("1:24");
    expect(formatDuration(5_400)).toBe("0:05");
  });
});

describe("formatCountdown", () => {
  test("shows hours, minutes and seconds", () => {
    expect(formatCountdown(((5 * 60 + 12) * 60 + 40) * 1000)).toBe("05:12:40");
  });

  test("never goes below zero", () => {
    expect(formatCountdown(-1)).toBe("00:00:00");
  });
});
