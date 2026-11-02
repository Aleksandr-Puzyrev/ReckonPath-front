import { mutationOptions } from "@tanstack/react-query";

import { deviceInfo, startSession, useAccountStore } from "@entities/session";
import { apiClient, readData } from "@shared/api";

interface LoginInput {
  email: string;
  password: string;
}

export const loginMutationOptions = () =>
  mutationOptions({
    mutationKey: ["account", "login"],
    // Offline it fails at once instead of pausing: a paused mutation would be persisted with the password (без сети сразу ошибка, а не пауза: приостановленная мутация сохранилась бы вместе с паролем).
    networkMode: "always",
    // A finished mutation keeps its variables in the cache; the password must not stay there (завершённая мутация хранит переменные в кэше; пароль не должен там оставаться).
    gcTime: 0,
    mutationFn: async ({ email, password }: LoginInput) => {
      const body = { email, password, device: await deviceInfo() };
      await startSession(readData(await apiClient.POST("/auth/login", { body })));
      useAccountStore.getState().markSignedIn();
    },
  });
