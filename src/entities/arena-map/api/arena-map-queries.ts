import { queryOptions, useQuery } from "@tanstack/react-query";

import { apiClient, readData } from "@shared/api";

import type { ArenaMap } from "../model/arena-map-type";

const MAPS_STALE_MS = 60_000;

export const arenaMapKeys = {
  all: ["arena-map"] as const,
  list: () => [...arenaMapKeys.all, "list"] as const,
};

export const arenaMapsQueryOptions = () =>
  queryOptions({
    queryKey: arenaMapKeys.list(),
    queryFn: async () =>
      // openapi-fetch widens response tuples to number[][] (openapi-fetch расширяет кортежи ответа до number[][]).
      readData(await apiClient.GET("/arena/maps")) as ArenaMap[],
    staleTime: MAPS_STALE_MS,
  });

export const useArenaMapsQuery = () => useQuery(arenaMapsQueryOptions());
