import { dayKeyOfLevelId } from "@entities/daily";

export type DailyRoute =
  | { kind: "daily"; dayKey: string }
  | { kind: "dailyLocked" }
  | { kind: "dayOver" }
  | { kind: "missing" };

interface RouteContext {
  isUnlocked: boolean;
  todayKey: string;
}

// Only today's daily can be played; a route of another day leads to today's (играется только сегодняшний дейли; маршрут другого дня ведёт к сегодняшнему).
export const resolveDailyRoute = (
  id: string,
  { isUnlocked, todayKey }: RouteContext,
): DailyRoute => {
  const dayKey = dayKeyOfLevelId(id);
  if (dayKey === null) return { kind: "missing" };
  if (!isUnlocked) return { kind: "dailyLocked" };
  if (dayKey !== todayKey) return { kind: "dayOver" };
  return { kind: "daily", dayKey };
};
