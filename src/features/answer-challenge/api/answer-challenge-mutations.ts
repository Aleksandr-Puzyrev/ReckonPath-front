import { mutationOptions } from "@tanstack/react-query";

import { apiClient, readData, readEmpty } from "@shared/api";

const pathOf = (id: string) => ({ params: { path: { id } } });

export const acceptChallengeMutationOptions = () =>
  mutationOptions({
    mutationKey: ["challenge", "accept"],
    mutationFn: async (id: string) =>
      readData(await apiClient.POST("/arena/challenges/{id}/accept", pathOf(id))),
  });

export const declineChallengeMutationOptions = () =>
  mutationOptions({
    mutationKey: ["challenge", "decline"],
    mutationFn: async (id: string) =>
      readEmpty(await apiClient.POST("/arena/challenges/{id}/decline", pathOf(id))),
  });
