import { mutationOptions } from "@tanstack/react-query";

import { apiClient, readData } from "@shared/api";

export const completeOnboardingMutationOptions = () =>
  mutationOptions({
    mutationKey: ["arena", "onboarding"],
    mutationFn: async () => readData(await apiClient.POST("/arena/onboarding")),
  });
