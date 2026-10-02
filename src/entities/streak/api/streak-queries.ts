import { queryOptions, useQuery } from "@tanstack/react-query";

import { apiClient, readData } from "@shared/api";

const STREAK_STALE_MS = 2 * 60_000;

export const streakKeys = {
  all: ["streak"] as const,
};

export const streakQueryOptions = () =>
  queryOptions({
    queryKey: streakKeys.all,
    queryFn: async () => readData(await apiClient.GET("/streak")),
    staleTime: STREAK_STALE_MS,
  });

export const useStreakQuery = () => useQuery(streakQueryOptions());
