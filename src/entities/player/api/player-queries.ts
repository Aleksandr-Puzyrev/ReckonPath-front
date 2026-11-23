import { queryOptions, useQuery } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";

import { apiClient, readData, useHasAccount } from "@shared/api";

const PLAYER_STALE_MS = 30_000;

export const playerKeys = {
  all: ["players"] as const,
  profile: (id: string) => [...playerKeys.all, "profile", id] as const,
  blocks: () => [...playerKeys.all, "blocks"] as const,
};

export const playerProfileQueryOptions = (id: string) =>
  queryOptions({
    queryKey: playerKeys.profile(id),
    queryFn: async () =>
      readData(await apiClient.GET("/arena/players/{id}", { params: { path: { id } } })),
    staleTime: PLAYER_STALE_MS,
  });

export const blocksQueryOptions = () =>
  queryOptions({
    queryKey: playerKeys.blocks(),
    queryFn: async () => readData(await apiClient.GET("/me/blocks")).users,
    staleTime: PLAYER_STALE_MS,
  });

// A block or a friend answer changes the relation in every profile and the blocked list (блокировка или ответ о дружбе меняют отношение в каждом профиле и список заблокированных).
export const invalidatePlayers = (queryClient: QueryClient) =>
  queryClient.invalidateQueries({ queryKey: playerKeys.all });

export const usePlayerProfileQuery = (id: string | null) =>
  useQuery({ ...playerProfileQueryOptions(id ?? ""), enabled: id !== null });

export const useBlocksQuery = () => useQuery({ ...blocksQueryOptions(), enabled: useHasAccount() });
