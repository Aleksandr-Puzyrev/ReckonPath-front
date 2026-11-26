import {
  infiniteQueryOptions,
  mutationOptions,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { uuidv7 } from "uuidv7";

import { apiClient, readData, readEmpty, useHasAccount } from "@shared/api";
import { HAS_BACKEND } from "@shared/config";

const notificationKeys = { history: ["notificationHistory"] as const };

export const notificationHistoryOptions = () =>
  infiniteQueryOptions({
    queryKey: notificationKeys.history,
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam, signal }) =>
      readData(
        await apiClient.GET("/me/notifications", {
          params: { query: { cursor: pageParam } },
          signal,
        }),
      ),
    getNextPageParam: (page) => page.nextCursor,
    staleTime: 30_000,
  });

export const useNotificationHistory = () => {
  const hasAccount = useHasAccount();
  return useInfiniteQuery({ ...notificationHistoryOptions(), enabled: HAS_BACKEND && hasAccount });
};

export const markNotificationReadOptions = () =>
  mutationOptions({
    mutationFn: async (id: string) =>
      readEmpty(
        await apiClient.PUT("/me/notifications/{id}/read", {
          params: { path: { id } },
          headers: { "Idempotency-Key": uuidv7() },
        }),
      ),
  });

export const useMarkNotificationRead = () => {
  const client = useQueryClient();
  return useMutation({
    ...markNotificationReadOptions(),
    onSuccess: () => client.invalidateQueries({ queryKey: notificationKeys.history }),
  });
};
