import { queryOptions, useQuery } from "@tanstack/react-query";

import { apiClient, readData, useHasAccount } from "@shared/api";

import type { CustomLevels } from "../model/custom-level-type";
import { savedCustomLevelOf } from "../model/custom-level-wire";

const LEVELS_STALE_MS = 60_000;

export const customLevelKeys = {
  all: ["custom-levels"] as const,
  list: () => [...customLevelKeys.all, "list"] as const,
  detail: (id: string) => [...customLevelKeys.all, "detail", id] as const,
};

export const fetchCustomLevels = async () => readData(await apiClient.GET("/levels/custom"));

export const customLevelsQueryOptions = () =>
  queryOptions({
    queryKey: customLevelKeys.list(),
    queryFn: async (): Promise<CustomLevels> => {
      const { levels, max } = await fetchCustomLevels();
      return { levels: levels.flatMap((view) => savedCustomLevelOf(view) ?? []), max };
    },
    staleTime: LEVELS_STALE_MS,
  });

export const customLevelQueryOptions = (id: string) =>
  queryOptions({
    queryKey: customLevelKeys.detail(id),
    queryFn: async () =>
      savedCustomLevelOf(
        readData(await apiClient.GET("/levels/custom/{id}", { params: { path: { id } } })),
      ),
    staleTime: LEVELS_STALE_MS,
  });

export const useCustomLevelsQuery = () =>
  useQuery({ ...customLevelsQueryOptions(), enabled: useHasAccount() });

export const useCustomLevelQuery = (id: string, isEnabled: boolean) =>
  useQuery({ ...customLevelQueryOptions(id), enabled: useHasAccount() && isEnabled });
