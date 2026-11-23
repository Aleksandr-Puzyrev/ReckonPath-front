import { mutationOptions } from "@tanstack/react-query";
import { uuidv7 } from "uuidv7";

import { apiClient, readEmpty } from "@shared/api";

export const blockPlayerMutationOptions = () =>
  mutationOptions({
    mutationKey: ["players", "block"],
    mutationFn: async (userId: string) =>
      readEmpty(
        await apiClient.POST("/users/{id}/block", {
          params: { path: { id: userId } },
          headers: { "Idempotency-Key": uuidv7() },
        }),
      ),
  });

export const unblockPlayerMutationOptions = () =>
  mutationOptions({
    mutationKey: ["players", "unblock"],
    mutationFn: async (userId: string) =>
      readEmpty(
        await apiClient.DELETE("/users/{id}/block", {
          params: { path: { id: userId } },
          headers: { "Idempotency-Key": uuidv7() },
        }),
      ),
  });
