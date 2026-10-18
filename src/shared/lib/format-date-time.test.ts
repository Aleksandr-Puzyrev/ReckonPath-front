import { formatDateTime } from "./format-date-time";

describe("formatDateTime", () => {
  test("prints the day, the month and the time in the locale", () => {
    const text = formatDateTime("2026-10-17T21:14:00", "en");

    expect(text).toContain("Oct");
    expect(text).toContain("17");
    expect(text).toMatch(/09:14|21:14/);
  });
});
