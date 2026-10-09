import { mutationOptions } from "@tanstack/react-query";

import { apiClient, readData } from "@shared/api";
import type { components } from "@shared/api";

type LoginBody = components["schemas"]["LoginRequest"];

export type LoginResult = components["schemas"]["LoginResult"];

export const loginMutationOptions = () =>
  mutationOptions({
    mutationKey: ["account", "login"],
    // Offline it fails at once instead of pausing: a paused mutation would be persisted with the password (без сети сразу ошибка, а не пауза: приостановленная мутация сохранилась бы вместе с паролем).
    networkMode: "always",
    mutationFn: async (body: LoginBody) => readData(await apiClient.POST("/auth/login", { body })),
  });
