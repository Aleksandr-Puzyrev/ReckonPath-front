import { mutationOptions } from "@tanstack/react-query";
import { uuidv7 } from "uuidv7";

import { apiClient, readEmpty } from "@shared/api";

export const redeemInviteMutationOptions = () =>
  mutationOptions({
    mutationKey: ["friends", "redeem"],
    mutationFn: async (code: string) =>
      readEmpty(
        await apiClient.POST("/me/invite", {
          body: { code },
          headers: { "Idempotency-Key": uuidv7() },
        }),
      ),
  });
