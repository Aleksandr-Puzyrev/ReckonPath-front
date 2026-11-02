import { mutationOptions } from "@tanstack/react-query";

import { apiClient, readEmpty } from "@shared/api";

export const removeDeviceMutationOptions = () =>
  mutationOptions({
    mutationKey: ["devices", "remove"],
    mutationFn: async (id: string) =>
      readEmpty(await apiClient.DELETE("/me/devices/{id}", { params: { path: { id } } })),
  });
