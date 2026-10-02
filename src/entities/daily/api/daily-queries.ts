import { queryOptions, useQuery } from "@tanstack/react-query";

import { apiClient, readData } from "@shared/api";

const DAILY_STALE_MS = 2 * 60_000;
const HISTORY_DAYS = 30;

export const dailyKeys = {
  all: ["daily"] as const,
  day: (dayKey: string) => [...dailyKeys.all, "day", dayKey] as const,
  history: () => [...dailyKeys.all, "history"] as const,
};

export const dailyDayQueryOptions = (dayKey: string) =>
  queryOptions({
    queryKey: dailyKeys.day(dayKey),
    queryFn: async () =>
      readData(await apiClient.GET("/daily/{date}", { params: { path: { date: dayKey } } })),
    staleTime: DAILY_STALE_MS,
  });

export const dailyHistoryQueryOptions = () =>
  queryOptions({
    queryKey: dailyKeys.history(),
    queryFn: async () =>
      readData(
        await apiClient.GET("/daily/history", { params: { query: { days: HISTORY_DAYS } } }),
      ),
    staleTime: DAILY_STALE_MS,
  });

export const useDailyDayQuery = (dayKey: string) => useQuery(dailyDayQueryOptions(dayKey));

export const useDailyHistoryQuery = () => useQuery(dailyHistoryQueryOptions());
