import { mutationOptions } from "@tanstack/react-query";

import { apiClient, readData } from "@shared/api";

export const confirmEmailMutationOptions = () =>
  mutationOptions({
    mutationKey: ["account", "confirm-email"],
    networkMode: "always",
    mutationFn: async (code: string) =>
      readData(await apiClient.POST("/me/email/confirm", { body: { code } })),
  });
