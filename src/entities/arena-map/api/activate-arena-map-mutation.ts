import { mutationOptions } from "@tanstack/react-query";

import { apiClient, readData } from "@shared/api";

export const activateArenaMapMutationOptions = () =>
  mutationOptions({
    mutationKey: ["arena-map", "activate"],
    mutationFn: async (id: string) =>
      readData(await apiClient.POST("/arena/maps/{id}/activate", { params: { path: { id } } })),
  });
