import { useEffect, useState } from "react";

import { useClockOffset } from "@entities/app-config";
import { dayKeyAfter, dayKeyOf, nextDayStartOf } from "@entities/daily";

const TICK_MS = 1000;

const serverNow = (offset: number) => Date.now() + offset;

// The game day follows the server clock, the phone clock until the first answer; it re-renders only when the day changes (игровой день идёт по серверным часам, до первого ответа — по часам телефона; перерисовка только при смене дня).
export const useDailyToday = () => {
  const offset = useClockOffset();
  const [phoneNow, setPhoneNow] = useState(Date.now);
  const todayKey = dayKeyOf(phoneNow + offset);

  useEffect(() => {
    const now = serverNow(offset);
    const timer = setTimeout(() => setPhoneNow(Date.now()), nextDayStartOf(now) - now);
    return () => clearTimeout(timer);
  }, [offset, phoneNow]);

  return { todayKey, yesterdayKey: dayKeyAfter(todayKey, -1) };
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
