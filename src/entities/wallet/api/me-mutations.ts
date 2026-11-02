import { mutationOptions } from "@tanstack/react-query";

import { apiClient, readData, readEmpty } from "@shared/api";

export const deleteMeMutationOptions = () =>
  mutationOptions({
    mutationKey: ["me", "delete"],
    // A finished mutation keeps its variables in the cache; the password must not stay there (завершённая мутация хранит переменные в кэше; пароль не должен там оставаться).
    gcTime: 0,
    mutationFn: async (password: string) =>
      readData(await apiClient.DELETE("/me", { body: { password } })),
  });

export const restoreMeMutationOptions = () =>
  mutationOptions({
    mutationKey: ["me", "restore"],
    mutationFn: async () => readEmpty(await apiClient.POST("/me/restore")),
  });
