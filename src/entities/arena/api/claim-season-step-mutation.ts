import { mutationOptions } from "@tanstack/react-query";

import { apiClient, readData } from "@shared/api";

export const claimSeasonStepMutationOptions = () =>
  mutationOptions({
    mutationKey: ["arena", "claim"],
    mutationFn: async (step: number) =>
      readData(await apiClient.POST("/arena/season/claim", { body: { step } })),
  });
