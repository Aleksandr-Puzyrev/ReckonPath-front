import { mutationOptions } from "@tanstack/react-query";
import { uuidv7 } from "uuidv7";

import type { ReportReason } from "@entities/player";
import { apiClient, readEmpty } from "@shared/api";

interface ReportInput {
  userId: string;
  reason: ReportReason;
  matchId?: string;
}

export const reportPlayerMutationOptions = () =>
  mutationOptions({
    mutationKey: ["players", "report"],
    mutationFn: async ({ userId, reason, matchId }: ReportInput) =>
      readEmpty(
        await apiClient.POST("/users/{id}/report", {
          params: { path: { id: userId } },
          body: { reason, ...(matchId === undefined ? {} : { matchId }) },
          headers: { "Idempotency-Key": uuidv7() },
        }),
      ),
  });
