// A game day is a UTC date, so it is printed in UTC whatever the phone's zone (игровой день — дата по UTC, поэтому печатается в UTC при любой зоне телефона).
const UTC = "UTC";

export const formatDayMonth = (dayKey: string, locale: string) =>
  new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", timeZone: UTC }).format(
    new Date(dayKey),
  );

export const formatWeekday = (dayKey: string, locale: string) =>
  new Intl.DateTimeFormat(locale, { weekday: "long", timeZone: UTC }).format(new Date(dayKey));

// Any Monday works: only the weekday names are read from it (подойдёт любой понедельник: из него берутся только названия дней).
const A_MONDAY = Date.UTC(2026, 8, 28);
const DAY_MS = 86_400_000;
const WEEK = 7;

export const mondayFirstWeekdays = (locale: string) => {
  const format = new Intl.DateTimeFormat(locale, { weekday: "narrow", timeZone: UTC });
  return Array.from({ length: WEEK }, (_, index) => format.format(A_MONDAY + index * DAY_MS));
};
