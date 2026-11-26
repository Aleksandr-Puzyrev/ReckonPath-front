import {
  infiniteQueryOptions,
  queryOptions,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";

import { apiClient, readData, useHasAccount } from "@shared/api";
import { HAS_BACKEND } from "@shared/config";

const STALE_MS = 30_000;
const PAGE_SIZE = 50;
const MAX_PAGE = 199;

export const competitionKeys = {
  events: ["events"] as const,
  preview: (code: string) => ["eventPreview", code] as const,
  event: (code: string) => ["event", code] as const,
  standings: (code: string) => [...competitionKeys.event(code), "standings"] as const,
  attempt: (code: string, id: string) => [...competitionKeys.event(code), "attempt", id] as const,
  achievements: ["achievements"] as const,
};

const nextPage = (last: readonly unknown[], _pages: readonly unknown[], page: number) =>
  last.length === PAGE_SIZE && page < MAX_PAGE ? page + 1 : undefined;

export const eventsOptions = () =>
  infiniteQueryOptions({
    queryKey: competitionKeys.events,
    queryFn: async ({ pageParam, signal }) =>
      readData(await apiClient.GET("/events", { params: { query: { page: pageParam } }, signal })),
    initialPageParam: 0,
    getNextPageParam: nextPage,
    staleTime: STALE_MS,
  });

export const eventOptions = (code: string) =>
  queryOptions({
    queryKey: competitionKeys.event(code),
    queryFn: async ({ signal }) =>
      readData(await apiClient.GET("/events/{code}", { params: { path: { code } }, signal })),
    staleTime: STALE_MS,
    refetchInterval: (query) => (query.state.data?.status === "finished" ? false : STALE_MS),
  });

export const eventPreviewOptions = (code: string) =>
  queryOptions({
    queryKey: competitionKeys.preview(code),
    queryFn: async ({ signal }) =>
      readData(await apiClient.GET("/events/{code}/share", { params: { path: { code } }, signal })),
    staleTime: STALE_MS,
  });

export const useEventPreview = (code: string) =>
  useQuery({ ...eventPreviewOptions(code), enabled: HAS_BACKEND && isEventCode(code) });

export const standingsOptions = (code: string) =>
  infiniteQueryOptions({
    queryKey: competitionKeys.standings(code),
    queryFn: async ({ pageParam, signal }) =>
      readData(
        await apiClient.GET("/events/{code}/leaderboard", {
          params: { path: { code }, query: { page: pageParam } },
          signal,
        }),
      ),
    initialPageParam: 0,
    getNextPageParam: nextPage,
    staleTime: STALE_MS,
  });

const fetchAttempt = async (code: string, id: string, signal?: AbortSignal) =>
  readData(
    await apiClient.GET("/events/{code}/attempts/{id}", {
      params: { path: { code, id } },
      signal,
    }),
  );

export type EventAttempt = Awaited<ReturnType<typeof fetchAttempt>>;

export const storeEventAttempt = (client: QueryClient, code: string, attempt: EventAttempt) => {
  client.setQueryData(competitionKeys.attempt(code, attempt.id), attempt);
  if (attempt.status === "play") return;
  void client.invalidateQueries({ queryKey: competitionKeys.standings(code) });
  void client.invalidateQueries({ queryKey: competitionKeys.achievements });
};

export const attemptOptions = (code: string, id: string) =>
  queryOptions({
    queryKey: competitionKeys.attempt(code, id),
    queryFn: ({ signal }) => fetchAttempt(code, id, signal),
    // A tap returns the complete attempt. Refetch it explicitly when recovering an uncertain write.
    staleTime: Infinity,
  });

export const achievementsOptions = () =>
  queryOptions({
    queryKey: competitionKeys.achievements,
    queryFn: async ({ signal }) => readData(await apiClient.GET("/me/achievements", { signal })),
    staleTime: STALE_MS,
  });

export const isEventCode = (code: string) => /^[A-Z2-9]{8}$/.test(code);

export const useCompetitionAvailable = () => {
  const hasAccount = useHasAccount();
  return HAS_BACKEND && hasAccount;
};

export const useEvents = () =>
  useInfiniteQuery({ ...eventsOptions(), enabled: useCompetitionAvailable() });
export const useEvent = (code: string) =>
  useQuery({ ...eventOptions(code), enabled: useCompetitionAvailable() && isEventCode(code) });
export const useEventStandings = (code: string) =>
  useInfiniteQuery({
    ...standingsOptions(code),
    enabled: useCompetitionAvailable() && isEventCode(code),
  });
export const useEventAttempt = (code: string, id: string) =>
  useQuery({
    ...attemptOptions(code, id),
    enabled: useCompetitionAvailable() && isEventCode(code) && id !== "",
  });
export const useAchievements = () =>
  useQuery({ ...achievementsOptions(), enabled: useCompetitionAvailable() });
