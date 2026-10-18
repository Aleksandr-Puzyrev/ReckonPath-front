import { mutationOptions } from "@tanstack/react-query";

import { apiClient, readEmpty } from "@shared/api";

export const deleteArenaMapMutationOptions = () =>
  mutationOptions({
    mutationKey: ["arena-map", "delete"],
    mutationFn: async (id: string) =>
      readEmpty(await apiClient.DELETE("/arena/maps/{id}", { params: { path: { id } } })),
  });
