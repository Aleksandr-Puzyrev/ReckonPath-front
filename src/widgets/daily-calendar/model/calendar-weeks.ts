import { dayKeyAfter } from "@entities/daily";

export type CalendarDayResult = "won" | "lost" | "restored";

export interface CalendarDay {
  dayKey: string;
  result: CalendarDayResult | null;
  isToday: boolean;
}

export type CalendarCell = CalendarDay | null;

const DAYS = 30;
const WEEK = 7;
const SUNDAY = 0;

const mondayIndexOf = (dayKey: string) => {
  const weekday = new Date(dayKey).getUTCDay();
  return weekday === SUNDAY ? WEEK - 1 : weekday - 1;
};

// The last 30 days in Monday-first weeks; empty cells pad the first week (последние 30 дней неделями с понедельника; первую неделю дополняют пустые клетки).
export const calendarWeeksOf = (
  todayKey: string,
  results: ReadonlyMap<string, CalendarDayResult>,
): CalendarCell[][] => {
  const days = Array.from({ length: DAYS }, (_, index): CalendarDay => {
    const dayKey = dayKeyAfter(todayKey, index - (DAYS - 1));
    return { dayKey, result: results.get(dayKey) ?? null, isToday: dayKey === todayKey };
  });
  const firstDay = days[0];
  const padding: CalendarCell[] = Array.from(
    { length: firstDay === undefined ? 0 : mondayIndexOf(firstDay.dayKey) },
    () => null,
  );
  const cells = [...padding, ...days];
  return Array.from({ length: Math.ceil(cells.length / WEEK) }, (_, week) => {
    const row = cells.slice(week * WEEK, (week + 1) * WEEK);
    return [...row, ...Array.from({ length: WEEK - row.length }, () => null)];
  });
};
