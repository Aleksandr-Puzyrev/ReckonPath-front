import { formatRelativeDay } from "./format-relative-day";

const NOW = new Date(2026, 10, 23, 12).getTime();
describe("formatRelativeDay", () => {
  test("names yesterday and today in words", () => {
    expect(formatRelativeDay(new Date(2026, 10, 22, 23).toISOString(), NOW, "ru")).toBe("вчера");
    expect(formatRelativeDay(new Date(2026, 10, 23, 1).toISOString(), NOW, "en")).toBe("today");
  });

  test("counts older days back from today", () => {
    expect(formatRelativeDay(new Date(2026, 10, 18, 9).toISOString(), NOW, "en")).toBe(
      "5 days ago",
    );
  });
});
