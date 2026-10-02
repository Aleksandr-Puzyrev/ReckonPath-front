import { formatDayMonth, formatWeekday, mondayFirstWeekdays } from "./format-day";

describe("formatDayMonth", () => {
  test("prints the day and the month of a game day", () => {
    expect(formatDayMonth("2026-09-28", "ru")).toBe("28 сентября");
    expect(formatDayMonth("2026-09-28", "en")).toBe("September 28");
  });
});

describe("formatWeekday", () => {
  test("prints the weekday of a game day", () => {
    expect(formatWeekday("2026-09-28", "ru")).toBe("понедельник");
  });
});

describe("mondayFirstWeekdays", () => {
  test("names the week from Monday", () => {
    expect(mondayFirstWeekdays("ru")).toEqual(["П", "В", "С", "Ч", "П", "С", "В"]);
  });
});
