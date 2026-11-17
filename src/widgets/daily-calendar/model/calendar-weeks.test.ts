import { calendarWeeksOf } from "./calendar-weeks";

describe("calendarWeeksOf", () => {
  test("lays out the last 30 days in Monday-first weeks ending today", () => {
    const weeks = calendarWeeksOf("2026-09-28", new Set());
    const days = weeks.flat().filter((cell) => cell !== null);

    expect(days).toHaveLength(30);
    expect(days[0]?.dayKey).toBe("2026-08-30");
    expect(days.at(-1)).toMatchObject({ dayKey: "2026-09-28", isToday: true });
    expect(weeks.every((week) => week.length === 7)).toBe(true);
  });

  test("starts the first week on its weekday", () => {
    const [firstWeek] = calendarWeeksOf("2026-09-28", new Set());

    expect(firstWeek?.slice(0, 6)).toEqual([null, null, null, null, null, null]);
    expect(firstWeek?.[6]?.dayKey).toBe("2026-08-30");
  });

  test("marks the won days only (decision 0061 #7)", () => {
    const weeks = calendarWeeksOf("2026-09-28", new Set(["2026-09-27"]));

    expect(weeks.flat().find((cell) => cell?.dayKey === "2026-09-27")?.isWon).toBe(true);
    expect(weeks.flat().find((cell) => cell?.dayKey === "2026-09-26")?.isWon).toBe(false);
  });
});
