import {
  infiniteQueryOptions,
  queryOptions,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";

import { apiClient, readData } from "@shared/api";

import type { MatchDetails } from "../model/match-type";

const HISTORY_STALE_MS = 60_000;
// A finished match never changes (завершённый матч не меняется).
const DETAILS_STALE_MS = Infinity;

export const matchKeys = {
  all: ["match"] as const,
  history: () => [...matchKeys.all, "history"] as const,
  details: (id: string) => [...matchKeys.all, "details", id] as const,
};

export const matchHistoryQueryOptions = () =>
  infiniteQueryOptions({
    queryKey: matchKeys.history(),
    queryFn: async ({ pageParam }) =>
      readData(
        await apiClient.GET("/arena/matches", {
          params: { query: pageParam === null ? {} : { cursor: pageParam } },
        }),
      ),
    initialPageParam: null as string | null,
    getNextPageParam: ({ nextCursor }) => nextCursor,
    staleTime: HISTORY_STALE_MS,
  });

export const matchDetailsQueryOptions = (id: string) =>
  queryOptions({
    queryKey: matchKeys.details(id),
    queryFn: async () =>
      // openapi-fetch widens response tuples to number[][] (openapi-fetch расширяет кортежи ответа до number[][]).
      readData(
        await apiClient.GET("/arena/matches/{id}", { params: { path: { id } } }),
      ) as MatchDetails,
    staleTime: DETAILS_STALE_MS,
  });

export const useMatchHistoryQuery = () => useInfiniteQuery(matchHistoryQueryOptions());

export const useMatchDetailsQuery = (id: string) => useQuery(matchDetailsQueryOptions(id));
