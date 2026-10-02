import type { DailyRecord } from "@entities/daily";
import type { CalendarDayResult } from "@widgets/daily-calendar";

interface HistoryDay {
  date: string;
  result: "won" | "lost" | null;
  restored: boolean;
}

// The server's history wins; local records fill the days it has not heard about yet (история сервера главнее; локальные записи дополняют дни, о которых он ещё не знает).
export const calendarResultsOf = (
  history: readonly HistoryDay[],
  records: Record<string, DailyRecord>,
) => {
  const results = new Map<string, CalendarDayResult>(
    Object.entries(records).map(([dayKey, record]) => [dayKey, record.result]),
  );
  history.forEach(({ date, result, restored }) => {
    if (restored) results.set(date, "restored");
    else if (result !== null) results.set(date, result);
  });
  return results;
};
