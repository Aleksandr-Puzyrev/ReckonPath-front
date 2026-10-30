import { mutationOptions } from "@tanstack/react-query";

import { deviceInfo, startSession, useAccountStore } from "@entities/session";
import { apiClient, readData } from "@shared/api";

interface VerifyInput {
  email: string;
  code: string;
}

export const verifyEmailMutationOptions = () =>
  mutationOptions({
    mutationKey: ["account", "verify-email"],
    networkMode: "always",
    mutationFn: async ({ email, code }: VerifyInput) => {
      const body = { email, code, device: await deviceInfo() };
      await startSession(readData(await apiClient.POST("/auth/register/verify", { body })));
      useAccountStore.getState().markRegistered();
    },
  });
