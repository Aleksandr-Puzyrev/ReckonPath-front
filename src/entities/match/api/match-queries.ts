import {
  infiniteQueryOptions,
  queryOptions,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";

import { apiClient, isApiError, readData, useHasAccount } from "@shared/api";
import { HAS_ARENA_SERVER } from "@shared/config";

import type { MatchView } from "../model/match-type";

const HISTORY_STALE_MS = 60_000;
const HISTORY_PAGE = 20;
// A finished match never changes (завершённый матч не меняется).
const DETAILS_STALE_MS = Infinity;

export const matchKeys = {
  all: ["match"] as const,
  history: () => [...matchKeys.all, "history"] as const,
  details: (id: string) => [...matchKeys.all, "details", id] as const,
};

export const fetchMatch = async (id: string) =>
  readData(await apiClient.GET("/arena/matches/{id}", { params: { path: { id } } }));

export const fetchMatchHistory = async (before: string | null) =>
  readData(
    await apiClient.GET("/arena/history", {
      params: {
        query: before === null ? { limit: HISTORY_PAGE } : { limit: HISTORY_PAGE, before },
      },
    }),
  );

export const loadCurrentMatch = async (): Promise<MatchView | null> => {
  try {
    return readData(await apiClient.GET("/arena/matches/current"));
  } catch (error) {
    if (isApiError(error) && error.code === "match_not_found") return null;
    throw error;
  }
};

export const matchHistoryQueryOptions = () =>
  infiniteQueryOptions({
    queryKey: matchKeys.history(),
    queryFn: ({ pageParam }) => fetchMatchHistory(pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: ({ nextBefore }) => nextBefore ?? null,
    staleTime: HISTORY_STALE_MS,
  });

export const matchDetailsQueryOptions = (id: string) =>
  queryOptions({
    queryKey: matchKeys.details(id),
    queryFn: () => fetchMatch(id),
    staleTime: DETAILS_STALE_MS,
  });

export const useMatchHistoryQuery = () =>
  useInfiniteQuery({ ...matchHistoryQueryOptions(), enabled: useHasAccount() && HAS_ARENA_SERVER });

export const useMatchDetailsQuery = (id: string) =>
  useQuery({ ...matchDetailsQueryOptions(id), enabled: useHasAccount() && HAS_ARENA_SERVER });
