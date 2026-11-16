import { queryOptions, useQuery } from "@tanstack/react-query";

import { apiClient, readData, useHasAccount } from "@shared/api";
import { HAS_ARENA_SERVER } from "@shared/config";

import type { ArenaMaps } from "../model/arena-map-type";
import { arenaMapOf } from "../model/level-of-map";

const MAPS_STALE_MS = 60_000;

export const arenaMapKeys = {
  all: ["arena-map"] as const,
  list: () => [...arenaMapKeys.all, "list"] as const,
};

export const fetchArenaMaps = async () => readData(await apiClient.GET("/arena/maps"));

export const arenaMapsQueryOptions = () =>
  queryOptions({
    queryKey: arenaMapKeys.list(),
    queryFn: async (): Promise<ArenaMaps> => {
      const { format, maps, max } = await fetchArenaMaps();
      return { format, maps: maps.map(arenaMapOf), max };
    },
    staleTime: MAPS_STALE_MS,
  });

export const useArenaMapsQuery = () =>
  useQuery({ ...arenaMapsQueryOptions(), enabled: useHasAccount() && HAS_ARENA_SERVER });
