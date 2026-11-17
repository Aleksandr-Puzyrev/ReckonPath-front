import { keepPreviousData, queryOptions, useQuery } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";

import { apiClient, readData, useHasAccount } from "@shared/api";

const FRIENDS_STALE_MS = 30_000;
const INVITE_STALE_MS = 5 * 60_000;

export const friendKeys = {
  all: ["friends"] as const,
  list: () => [...friendKeys.all, "list"] as const,
  search: (nickname: string) => [...friendKeys.all, "search", nickname] as const,
  invite: () => [...friendKeys.all, "invite"] as const,
};

export const friendsQueryOptions = () =>
  queryOptions({
    queryKey: friendKeys.list(),
    queryFn: async () => readData(await apiClient.GET("/friends")),
    staleTime: FRIENDS_STALE_MS,
  });

export const friendSearchQueryOptions = (nickname: string) =>
  queryOptions({
    queryKey: friendKeys.search(nickname),
    queryFn: async () =>
      readData(await apiClient.GET("/friends/search", { params: { query: { nickname } } })).users,
    staleTime: FRIENDS_STALE_MS,
  });

export const inviteQueryOptions = () =>
  queryOptions({
    queryKey: friendKeys.invite(),
    queryFn: async () => readData(await apiClient.GET("/me/invite")),
    staleTime: INVITE_STALE_MS,
  });

// Every friends answer may change the list, the counts, the search relations and the invite (любой ответ о друзьях может изменить список, счётчики, отношения в поиске и приглашение).
export const invalidateFriends = (queryClient: QueryClient) =>
  queryClient.invalidateQueries({ queryKey: friendKeys.all });

// The Profile tab dot follows the requests, so the list is re-read whenever the app comes back (точка вкладки «Профиль» следует за заявками, поэтому список перечитывается при каждом возврате в приложение).
export const useFriendsQuery = () =>
  useQuery({ ...friendsQueryOptions(), enabled: useHasAccount(), refetchOnWindowFocus: "always" });

export const useFriendSearchQuery = (nickname: string | null) =>
  useQuery({
    ...friendSearchQueryOptions(nickname ?? ""),
    enabled: nickname !== null,
    placeholderData: keepPreviousData,
  });

export const useInviteQuery = () => useQuery({ ...inviteQueryOptions(), enabled: useHasAccount() });
