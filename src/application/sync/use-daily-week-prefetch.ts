import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { dailyDayQueryOptions, dayKeyAfter } from "@entities/daily";
import { useDailyToday } from "@features/daily-today";

const DAYS_AHEAD = 7;

// Admin overrides of the coming days are cached, so they play offline too (DLY-13) (подмены админа на ближайшие дни кэшируются, чтобы играть их и офлайн).
export const useDailyWeekPrefetch = () => {
  const queryClient = useQueryClient();
  const { todayKey } = useDailyToday();

  useEffect(() => {
    Array.from({ length: DAYS_AHEAD }, (_, index) => dayKeyAfter(todayKey, index)).forEach(
      (dayKey) => queryClient.prefetchQuery(dailyDayQueryOptions(dayKey)),
    );
  }, [queryClient, todayKey]);
};
