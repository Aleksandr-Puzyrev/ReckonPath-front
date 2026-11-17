import { queryOptions, useQuery } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";

import { apiClient, readData, useHasAccount } from "@shared/api";

const DAILY_STALE_MS = 30_000;
const HISTORY_STALE_MS = 2 * 60_000;
const HISTORY_DAYS = 30;

export const dailyKeys = {
  all: ["daily"] as const,
  overview: () => [...dailyKeys.all, "overview"] as const,
  history: () => [...dailyKeys.all, "history"] as const,
  leaderboard: () => [...dailyKeys.all, "leaderboard"] as const,
  game: (id: string) => [...dailyKeys.all, "game", id] as const,
};

export const fetchDaily = async () => readData(await apiClient.GET("/daily"));

export const fetchDailyGame = async (id: string) =>
  readData(await apiClient.GET("/daily/games/{id}", { params: { path: { id } } }));

export const fetchDailyHistory = async () =>
  readData(await apiClient.GET("/daily/history", { params: { query: { limit: HISTORY_DAYS } } }));

export const fetchDailyLeaderboard = async () =>
  readData(await apiClient.GET("/daily/leaderboard"));

export const dailyQueryOptions = () =>
  queryOptions({ queryKey: dailyKeys.overview(), queryFn: fetchDaily, staleTime: DAILY_STALE_MS });

export const dailyHistoryQueryOptions = () =>
  queryOptions({
    queryKey: dailyKeys.history(),
    queryFn: fetchDailyHistory,
    staleTime: HISTORY_STALE_MS,
  });

export const dailyLeaderboardQueryOptions = () =>
  queryOptions({
    queryKey: dailyKeys.leaderboard(),
    queryFn: fetchDailyLeaderboard,
    staleTime: DAILY_STALE_MS,
  });

// Every answer of the game carries the whole game, so the cached one is only replaced, never refetched by itself (каждый ответ партии несёт её целиком, поэтому сохранённая только заменяется и сама не перезапрашивается).
export const dailyGameQueryOptions = (id: string) =>
  queryOptions({
    queryKey: dailyKeys.game(id),
    queryFn: () => fetchDailyGame(id),
    staleTime: Infinity,
  });

export const dailyGameKey = (id: string) => dailyGameQueryOptions(id).queryKey;

// A finished game changes the day, the history and the top, but never the cached game itself (законченная партия меняет день, историю и топ, но не саму сохранённую партию).
export const invalidateDailyProgress = (queryClient: QueryClient) =>
  Promise.all([
    queryClient.invalidateQueries({ queryKey: dailyKeys.overview() }),
    queryClient.invalidateQueries({ queryKey: dailyKeys.history() }),
    queryClient.invalidateQueries({ queryKey: dailyKeys.leaderboard() }),
  ]);

export const useDailyQuery = () => useQuery({ ...dailyQueryOptions(), enabled: useHasAccount() });

export const useDailyHistoryQuery = () =>
  useQuery({ ...dailyHistoryQueryOptions(), enabled: useHasAccount() });

export const useDailyLeaderboardQuery = () =>
  useQuery({ ...dailyLeaderboardQueryOptions(), enabled: useHasAccount() });

export const useDailyGameQuery = (id: string | null) =>
  useQuery({ ...dailyGameQueryOptions(id ?? ""), enabled: id !== null });
