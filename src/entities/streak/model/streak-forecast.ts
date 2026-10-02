import type { components } from "@shared/api";

type StreakState = components["schemas"]["StreakState"];

interface ForecastDays {
  todayKey: string;
  yesterdayKey: string;
  hasCountedToday: boolean;
}

export interface StreakForecast {
  current: number;
  best: number;
  lost: number | null;
}

// The server owns the streak; until it answers, a missed day breaks it and a counted attempt not yet sent adds today (серия — на сервере; до его ответа пропуск обрывает её, а неотправленная зачётная попытка добавляет сегодняшний день).
export const streakForecastOf = (
  streak: StreakState | undefined,
  { todayKey, yesterdayKey, hasCountedToday }: ForecastDays,
): StreakForecast => {
  const saved = streak?.current ?? 0;
  const isAlive = streak?.lastDay === todayKey || streak?.lastDay === yesterdayKey;
  const base = isAlive ? saved : 0;
  const current = hasCountedToday && streak?.lastDay !== todayKey ? base + 1 : base;
  return {
    current,
    best: Math.max(streak?.best ?? 0, current),
    lost: !isAlive && saved > 0 ? saved : null,
  };
};
