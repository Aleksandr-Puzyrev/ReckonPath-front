import { mutationOptions } from "@tanstack/react-query";

import { apiClient, readEmpty } from "@shared/api";
import type { components } from "@shared/api";

type ResetBody = components["schemas"]["ResetPasswordRequest"];

export const resetPasswordMutationOptions = () =>
  mutationOptions({
    mutationKey: ["account", "reset-password"],
    // Offline it fails at once instead of pausing: a paused mutation would be persisted with the password (без сети сразу ошибка, а не пауза: приостановленная мутация сохранилась бы вместе с паролем).
    networkMode: "always",
    // A finished mutation keeps its variables in the cache; the password must not stay there (завершённая мутация хранит переменные в кэше; пароль не должен там оставаться).
    gcTime: 0,
    mutationFn: async (body: ResetBody) =>
      readEmpty(await apiClient.POST("/auth/password/reset", { body })),
  });
