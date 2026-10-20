import { mutationOptions } from "@tanstack/react-query";

import { apiClient, readData } from "@shared/api";

export const claimSeasonSummaryMutationOptions = () =>
  mutationOptions({
    mutationKey: ["arena", "summary"],
    mutationFn: async () => readData(await apiClient.POST("/arena/season/summary/claim")),
  });
