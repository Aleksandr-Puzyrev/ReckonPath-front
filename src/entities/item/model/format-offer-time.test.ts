import { i18n } from "@shared/i18n";

import { formatCardLeft, formatDropLeft } from "./format-offer-time";

const HOUR_MS = 3_600_000;
const DAY_MS = 24 * HOUR_MS;

describe("formatDropLeft", () => {
  beforeAll(() => i18n.changeLanguage("ru"));

  test("counts whole days", () => {
    expect(formatDropLeft(i18n.t, 6 * DAY_MS + 5 * HOUR_MS)).toBe("6 дней");
    expect(formatDropLeft(i18n.t, 2 * DAY_MS)).toBe("2 дня");
  });

  test("switches to hours and minutes in the last day", () => {
    expect(formatDropLeft(i18n.t, 5 * HOUR_MS + 7 * 60_000)).toBe("05:07");
  });
});

describe("formatCardLeft", () => {
  beforeAll(() => i18n.changeLanguage("ru"));

  test("shows days and hours", () => {
    expect(formatCardLeft(i18n.t, 5 * DAY_MS + 14 * HOUR_MS)).toBe("5д 14ч");
  });

  test("drops zero hours", () => {
    expect(formatCardLeft(i18n.t, 6 * DAY_MS)).toBe("6д");
  });

  test("switches to hours and minutes in the last day", () => {
    expect(formatCardLeft(i18n.t, 23 * HOUR_MS + 59 * 60_000)).toBe("23:59");
  });

  test("stops at zero after the end", () => {
    expect(formatCardLeft(i18n.t, -HOUR_MS)).toBe("00:00");
  });
});
