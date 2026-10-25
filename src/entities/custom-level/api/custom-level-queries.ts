import { queryOptions, useQuery } from "@tanstack/react-query";

import { levelSchema } from "@reckon-path/engine";
import type { LevelInput } from "@reckon-path/engine";

import { apiClient, readData } from "@shared/api";

const LEVELS_STALE_MS = 60_000;

export interface SavedCustomLevel {
  id: string;
  level: LevelInput;
  updatedAt: string;
}

export const customLevelKeys = {
  all: ["custom-levels"] as const,
};

// The level body is free JSON in the contract, so it is checked by the engine schema (тело уровня в контракте — свободный JSON, поэтому его проверяет схема движка).
const parseLevels = (items: readonly { id: string; level: unknown; updatedAt: string }[]) =>
  items.flatMap(({ id, level, updatedAt }): SavedCustomLevel[] => {
    const parsed = levelSchema.safeParse(level);
    return parsed.success ? [{ id, level: parsed.data, updatedAt }] : [];
  });

export const customLevelsQueryOptions = () =>
  queryOptions({
    queryKey: customLevelKeys.all,
    queryFn: async () => parseLevels(readData(await apiClient.GET("/levels/custom")).items),
    staleTime: LEVELS_STALE_MS,
  });

export const useCustomLevelsQuery = () => useQuery(customLevelsQueryOptions());
