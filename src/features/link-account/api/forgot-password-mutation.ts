import { mutationOptions } from "@tanstack/react-query";

import { apiClient, readData } from "@shared/api";

export const forgotPasswordMutationOptions = () =>
  mutationOptions({
    mutationKey: ["account", "forgot-password"],
    networkMode: "always",
    mutationFn: async (email: string) =>
      readData(await apiClient.POST("/auth/password/forgot", { body: { email } })),
  });
