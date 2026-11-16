import { mutationOptions } from "@tanstack/react-query";

import { apiClient, readData, readEmpty } from "@shared/api";

export const claimTrackStepMutationOptions = () =>
  mutationOptions({
    mutationKey: ["arena", "season", "step"],
    mutationFn: async (step: number) =>
      readData(
        await apiClient.POST("/arena/season/track/{step}/claim", { params: { path: { step } } }),
      ),
  });

export const claimSeasonResultMutationOptions = () =>
  mutationOptions({
    mutationKey: ["arena", "season", "result"],
    mutationFn: async () => readData(await apiClient.POST("/arena/season/result/claim")),
  });

export const markRulesSeenMutationOptions = () =>
  mutationOptions({
    mutationKey: ["arena", "rules-seen"],
    mutationFn: async () => readEmpty(await apiClient.PUT("/arena/rules-seen")),
  });
