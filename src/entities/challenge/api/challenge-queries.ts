import { queryOptions, useQuery } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";

import { apiClient, readData, useHasAccount } from "@shared/api";
import { HAS_ARENA_SERVER } from "@shared/config";

const CHALLENGES_STALE_MS = 30_000;

export const challengeKeys = {
  all: ["challenge"] as const,
  list: () => [...challengeKeys.all, "list"] as const,
};

export const challengesQueryOptions = () =>
  queryOptions({
    queryKey: challengeKeys.list(),
    queryFn: async () => readData(await apiClient.GET("/arena/challenges")),
    staleTime: CHALLENGES_STALE_MS,
  });

export const invalidateChallenges = (queryClient: QueryClient) =>
  queryClient.invalidateQueries({ queryKey: challengeKeys.all });

export const useChallengesQuery = (isEnabled: boolean) =>
  useQuery({
    ...challengesQueryOptions(),
    enabled: useHasAccount() && HAS_ARENA_SERVER && isEnabled,
  });
