import { mutationOptions } from "@tanstack/react-query";

import { apiClient, readData, readEmpty } from "@shared/api";
import type { AppLanguage } from "@shared/i18n";

export const updateLocaleMutationOptions = () =>
  mutationOptions({
    mutationKey: ["me", "locale"],
    mutationFn: async (locale: AppLanguage) =>
      readData(await apiClient.PATCH("/me", { body: { locale } })),
  });

export const deleteMeMutationOptions = () =>
  mutationOptions({
    mutationKey: ["me", "delete"],
    mutationFn: async (confirmNickname: string) =>
      readData(await apiClient.DELETE("/me", { body: { confirmNickname } })),
  });

export const restoreMeMutationOptions = () =>
  mutationOptions({
    mutationKey: ["me", "restore"],
    mutationFn: async () => readEmpty(await apiClient.POST("/me/restore")),
  });
