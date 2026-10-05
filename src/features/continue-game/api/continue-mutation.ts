import { mutationOptions } from "@tanstack/react-query";

import { apiClient, readData } from "@shared/api";

interface ContinueRequest {
  attemptId: string;
  idempotencyKey: string;
}

export const continueForEmeraldsMutationOptions = () =>
  mutationOptions({
    mutationKey: ["continue", "emeralds"],
    mutationFn: async ({ attemptId, idempotencyKey }: ContinueRequest) =>
      readData(
        await apiClient.POST("/continue", {
          body: { attemptId, method: "emeralds" },
          headers: { "Idempotency-Key": idempotencyKey },
        }),
      ),
  });
