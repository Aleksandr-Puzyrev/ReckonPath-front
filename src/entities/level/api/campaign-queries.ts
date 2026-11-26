import { queryOptions, useQuery } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";

import { apiClient, readData, useHasAccount } from "@shared/api";
import { HAS_BACKEND } from "@shared/config";

const CAMPAIGN_STALE_MS = 30_000;
const LEVEL_STALE_MS = 60_000;

export const campaignKeys = {
  all: ["campaign"] as const,
  stats: () => [...campaignKeys.all, "stats"] as const,
  overview: () => [...campaignKeys.all, "overview"] as const,
  levels: () => [...campaignKeys.all, "level"] as const,
  level: (number: number) => [...campaignKeys.levels(), number] as const,
  game: (id: string) => [...campaignKeys.all, "game", id] as const,
};

export const fetchCampaign = async () => readData(await apiClient.GET("/campaign"));

export const fetchCampaignLevel = async (number: number) =>
  readData(await apiClient.GET("/campaign/levels/{number}", { params: { path: { number } } }));

export const fetchCampaignGame = async (id: string) =>
  readData(await apiClient.GET("/campaign/games/{id}", { params: { path: { id } } }));

export const campaignQueryOptions = () =>
  queryOptions({
    queryKey: campaignKeys.overview(),
    queryFn: fetchCampaign,
    staleTime: CAMPAIGN_STALE_MS,
  });

export const campaignStatsOptions = () =>
  queryOptions({
    queryKey: campaignKeys.stats(),
    queryFn: async ({ signal }) => readData(await apiClient.GET("/campaign/stats", { signal })),
    staleTime: CAMPAIGN_STALE_MS,
  });

export const useCampaignStats = () => {
  const hasAccount = useHasAccount();
  return useQuery({ ...campaignStatsOptions(), enabled: HAS_BACKEND && hasAccount });
};

export const campaignLevelQueryOptions = (number: number) =>
  queryOptions({
    queryKey: campaignKeys.level(number),
    queryFn: () => fetchCampaignLevel(number),
    staleTime: LEVEL_STALE_MS,
  });

// Every answer of the game carries the whole game, so the cached one is only replaced, never refetched by itself (каждый ответ партии несёт её целиком, поэтому сохранённая только заменяется и сама не перезапрашивается).
export const campaignGameQueryOptions = (id: string) =>
  queryOptions({
    queryKey: campaignKeys.game(id),
    queryFn: () => fetchCampaignGame(id),
    staleTime: Infinity,
  });

// A finished game changes stars, states and unlocks, but never the cached game itself (законченная партия меняет звёзды, состояния и открытия, но не саму сохранённую партию).
export const invalidateCampaignProgress = (queryClient: QueryClient) =>
  Promise.all([
    queryClient.invalidateQueries({ queryKey: campaignKeys.overview() }),
    queryClient.invalidateQueries({ queryKey: campaignKeys.levels() }),
    queryClient.invalidateQueries({ queryKey: campaignKeys.stats() }),
  ]);

export const campaignGameKey = (id: string) => campaignGameQueryOptions(id).queryKey;

export const useCampaignQuery = () =>
  useQuery({ ...campaignQueryOptions(), enabled: useHasAccount() });

export const useCampaignLevelQuery = (number: number | null) =>
  useQuery({
    ...campaignLevelQueryOptions(number ?? 0),
    enabled: useHasAccount() && number !== null,
  });

export const useCampaignGameQuery = (id: string | null) =>
  useQuery({ ...campaignGameQueryOptions(id ?? ""), enabled: id !== null });
