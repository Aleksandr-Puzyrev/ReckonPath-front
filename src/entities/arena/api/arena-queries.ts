import { queryOptions, useQuery } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";

import { apiClient, readData, useHasAccount } from "@shared/api";
import { HAS_ARENA_SERVER } from "@shared/config";

import type { SeasonView } from "../model/arena-type";

const ARENA_STALE_MS = 30_000;

export const arenaKeys = {
  all: ["arena"] as const,
};

export const arenaQueryOptions = () =>
  queryOptions({
    queryKey: arenaKeys.all,
    queryFn: async () => readData(await apiClient.GET("/arena")),
    staleTime: ARENA_STALE_MS,
  });

export const useArenaQuery = () =>
  useQuery({ ...arenaQueryOptions(), enabled: useHasAccount() && HAS_ARENA_SERVER });

// A claim answers with the whole season, which replaces the home's season block (забор награды отвечает сезоном целиком, и он заменяет блок сезона на главной).
export const applySeason = (queryClient: QueryClient, season: SeasonView) =>
  queryClient.setQueryData(arenaQueryOptions().queryKey, (current) =>
    current === undefined ? current : { ...current, season },
  );
