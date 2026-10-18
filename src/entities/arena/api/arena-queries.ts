import { queryOptions, useQuery } from "@tanstack/react-query";

import { apiClient, readData } from "@shared/api";

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

export const useArenaQuery = () => useQuery(arenaQueryOptions());
