import { mutationOptions } from "@tanstack/react-query";
import { uuidv7 } from "uuidv7";

import { apiClient, readData } from "@shared/api";

export const sendFriendRequestMutationOptions = () =>
  mutationOptions({
    mutationKey: ["friends", "send"],
    mutationFn: async (userId: string) =>
      readData(
        await apiClient.POST("/friends/requests", {
          body: { userId },
          headers: { "Idempotency-Key": uuidv7() },
        }),
      ),
  });
