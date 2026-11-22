import { mutationOptions } from "@tanstack/react-query";

import { apiClient, readData, readEmpty } from "@shared/api";

const pathOf = (id: string) => ({ params: { path: { id } } });

// No league in the body: the challenge takes the player's own league format (decision 0062 #5) (лиги в теле нет: вызов идёт в формате своей лиги).
export const sendChallengeMutationOptions = () =>
  mutationOptions({
    mutationKey: ["challenge", "send"],
    mutationFn: async (friendId: string) =>
      readData(await apiClient.POST("/friends/{id}/challenge", pathOf(friendId))),
  });

export const cancelChallengeMutationOptions = () =>
  mutationOptions({
    mutationKey: ["challenge", "cancel"],
    mutationFn: async (id: string) =>
      readEmpty(await apiClient.DELETE("/arena/challenges/{id}", pathOf(id))),
  });
