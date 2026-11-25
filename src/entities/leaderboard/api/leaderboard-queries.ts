import { queryOptions, useQuery } from "@tanstack/react-query";

import { apiClient, readData, useHasAccount } from "@shared/api";

import type { LeaderboardPeriod, LeaderboardScope } from "../model/leaderboard-types";

const LEADERBOARD_STALE_MS = 60_000;

export const leaderboardKeys = {
  all: ["leaderboard"] as const,
  board: (period: LeaderboardPeriod, scope: LeaderboardScope) =>
    [...leaderboardKeys.all, period, scope] as const,
};

export const leaderboardQueryOptions = (period: LeaderboardPeriod, scope: LeaderboardScope) =>
  queryOptions({
    queryKey: leaderboardKeys.board(period, scope),
    queryFn: async () =>
      readData(await apiClient.GET("/arena/leaderboard", { params: { query: { period, scope } } })),
    staleTime: LEADERBOARD_STALE_MS,
  });

export const useLeaderboardQuery = (period: LeaderboardPeriod, scope: LeaderboardScope) =>
  useQuery({ ...leaderboardQueryOptions(period, scope), enabled: useHasAccount() });
