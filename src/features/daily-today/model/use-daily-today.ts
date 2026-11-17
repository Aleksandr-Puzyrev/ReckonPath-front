import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

import { useClockOffset } from "@entities/app-config";
import {
  dailyQueryOptions,
  dayKeyOf,
  invalidateDailyProgress,
  nextDayStartOf,
} from "@entities/daily";
import { streakKeys } from "@entities/streak";

const TICK_MS = 1000;

const serverNow = (offset: number) => Date.now() + offset;

// The game day follows the server clock, the phone clock until the first answer; it re-renders only when the day changes, and then asks the server for the new day (игровой день идёт по серверным часам, до первого ответа — по часам телефона; перерисовка только при смене дня, и тогда сервер спрашивают о новом дне).
export const useDailyToday = () => {
  const queryClient = useQueryClient();
  const offset = useClockOffset();
  const [phoneNow, setPhoneNow] = useState(Date.now);
  const todayKey = dayKeyOf(phoneNow + offset);
  const seenKeyRef = useRef(todayKey);

  // Also on mount: a cached day may be yesterday's (и при монтировании: сохранённый день может быть вчерашним).
  useEffect(() => {
    const cachedDate = queryClient.getQueryData(dailyQueryOptions().queryKey)?.day.date;
    const isCachedStale = cachedDate !== undefined && cachedDate !== todayKey;
    if (seenKeyRef.current === todayKey && !isCachedStale) return;
    seenKeyRef.current = todayKey;
    void invalidateDailyProgress(queryClient);
    void queryClient.invalidateQueries({ queryKey: streakKeys.all });
  }, [queryClient, todayKey]);

  useEffect(() => {
    const now = serverNow(offset);
    const timer = setTimeout(() => setPhoneNow(Date.now()), nextDayStartOf(now) - now);
    return () => clearTimeout(timer);
  }, [offset, phoneNow]);

  return { todayKey };
};

// Only the countdown text ticks every second, not the screens around it (каждую секунду обновляется только текст отсчёта, а не экраны вокруг).
export const useMsUntilNextDay = () => {
  const offset = useClockOffset();
  const [now, setNow] = useState(() => serverNow(offset));

  useEffect(() => {
    const timer = setInterval(() => setNow(serverNow(offset)), TICK_MS);
    return () => clearInterval(timer);
  }, [offset]);

  return nextDayStartOf(now) - now;
};
