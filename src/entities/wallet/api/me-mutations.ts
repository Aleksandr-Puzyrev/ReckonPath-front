import { mutationOptions } from "@tanstack/react-query";

import { apiClient, readData, readEmpty } from "@shared/api";
import type { AppLanguage } from "@shared/i18n";

import { mapMe } from "../model/map-me";

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

export const updateLocaleMutationOptions = () =>
  mutationOptions({
    mutationKey: ["me", "locale"],
    mutationFn: async (locale: AppLanguage) =>
      mapMe(readData(await apiClient.PATCH("/me", { body: { locale } }))),
  });

export const updateNicknameMutationOptions = () =>
  mutationOptions({
    mutationKey: ["me", "nickname"],
    // Offline the request must fail with a message instead of waiting paused (без сети запрос должен завершиться ошибкой с сообщением, а не ждать на паузе).
    networkMode: "always",
    mutationFn: async (nickname: string) =>
      mapMe(readData(await apiClient.PATCH("/me", { body: { nickname } }))),
  });
