import "./relative-time-format-polyfill";

const NATIVE_LOCALE = Intl.Locale;

const formatDays = (locale: string, days: number) =>
  new Intl.RelativeTimeFormat(locale, { numeric: "auto", localeMatcher: "lookup" }).format(
    days,
    "day",
  );

describe("relative time format polyfill", () => {
  afterEach(() => {
    Object.defineProperty(Intl, "Locale", { value: NATIVE_LOCALE, configurable: true });
  });

  test.each([
    ["ru", -1, "вчера"],
    ["ru", -3, "3 дня назад"],
    ["en", -1, "yesterday"],
    ["en", -5, "5 days ago"],
  ])("formats %s %i days in words", (locale, days, expected) => {
    expect(formatDays(locale, days)).toBe(expected);
  });

  test("works without Intl.Locale, as on Hermes", () => {
    Object.defineProperty(Intl, "Locale", { value: undefined, configurable: true });

    expect(formatDays("ru", -2)).toBe("позавчера");
  });
});
