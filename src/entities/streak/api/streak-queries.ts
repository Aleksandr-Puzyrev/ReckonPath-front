import { queryOptions, useQuery } from "@tanstack/react-query";

import { apiClient, readData, useHasAccount } from "@shared/api";

const STREAK_STALE_MS = 30_000;

export const streakKeys = {
  all: ["streak"] as const,
};

export const fetchStreak = async () => readData(await apiClient.GET("/streak"));

export const streakQueryOptions = () =>
  queryOptions({ queryKey: streakKeys.all, queryFn: fetchStreak, staleTime: STREAK_STALE_MS });

export const useStreakQuery = () => useQuery({ ...streakQueryOptions(), enabled: useHasAccount() });
