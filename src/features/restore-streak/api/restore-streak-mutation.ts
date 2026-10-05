import { mutationOptions } from "@tanstack/react-query";

import { apiClient, readData } from "@shared/api";

export const restoreStreakMutationOptions = () =>
  mutationOptions({
    mutationKey: ["streak", "restore"],
    mutationFn: async (idempotencyKey: string) =>
      readData(
        await apiClient.POST("/streak/restore", {
          body: { method: "emeralds" },
          headers: { "Idempotency-Key": idempotencyKey },
        }),
      ),
  });
