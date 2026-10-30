import { mutationOptions } from "@tanstack/react-query";

import { apiClient, readData, readEmpty } from "@shared/api";

export const deleteMeMutationOptions = () =>
  mutationOptions({
    mutationKey: ["me", "delete"],
    mutationFn: async (password: string) =>
      readData(await apiClient.DELETE("/me", { body: { password } })),
  });

export const restoreMeMutationOptions = () =>
  mutationOptions({
    mutationKey: ["me", "restore"],
    mutationFn: async () => readEmpty(await apiClient.POST("/me/restore")),
  });
