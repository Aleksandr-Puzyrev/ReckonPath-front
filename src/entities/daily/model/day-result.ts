import type { DailyDay } from "./daily-types";

export interface DayPlace {
  rank: number;
  total: number;
}

export interface DayResult {
  stars: number;
  moves: number;
  place: DayPlace | null;
}

// A day of another date is yesterday's answer still in the cache (день другой даты — вчерашний ответ, ещё лежащий в кэше).
export const todayOf = <Day extends Pick<DailyDay, "date">>(
  day: Day | undefined,
  todayKey: string,
) => (day?.date === todayKey ? day : undefined);

// Only a win counts: the day has a result once the server has my entry (засчитывается только победа: у дня есть итог, когда у сервера есть моя запись).
export const dayResultOf = (day: DailyDay | undefined): DayResult | null => {
  const mine = day?.mine;
  if (day === undefined || mine === undefined) return null;
  return {
    stars: mine.stars,
    moves: mine.moves,
    place: mine.rank === undefined ? null : { rank: mine.rank, total: day.players },
  };
};
