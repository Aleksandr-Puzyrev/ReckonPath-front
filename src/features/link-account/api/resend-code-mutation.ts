import { mutationOptions } from "@tanstack/react-query";

import { apiClient, readData } from "@shared/api";

export const resendCodeMutationOptions = () =>
  mutationOptions({
    mutationKey: ["account", "resend-code"],
    networkMode: "always",
    mutationFn: async (email: string) =>
      readData(await apiClient.POST("/auth/register/resend", { body: { email } })),
  });
