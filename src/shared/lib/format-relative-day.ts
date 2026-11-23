const DAY_MS = 86_400_000;

const startOfDay = (time: number) => {
  const day = new Date(time);
  day.setHours(0, 0, 0, 0);
  return day.getTime();
};

// "lookup" keeps the polyfill off Intl.Locale, which Hermes lacks (сопоставление "lookup" не трогает Intl.Locale, которого нет в Hermes).
const LOCALE_MATCHER = "lookup";

export const formatRelativeDay = (isoTime: string, now: number, locale: string) => {
  const days = Math.round((startOfDay(Date.parse(isoTime)) - startOfDay(now)) / DAY_MS);
  return new Intl.RelativeTimeFormat(locale, {
    numeric: "auto",
    localeMatcher: LOCALE_MATCHER,
  }).format(days, "day");
};
