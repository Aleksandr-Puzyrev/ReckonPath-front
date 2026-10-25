import { mutationOptions } from "@tanstack/react-query";

import type { LevelInput } from "@reckon-path/engine";

import { apiClient, readData, readEmpty } from "@shared/api";

interface SaveRequest {
  id: string | null;
  level: LevelInput;
}

export const saveCustomLevelMutationOptions = () =>
  mutationOptions({
    mutationKey: ["custom-levels", "save"],
    mutationFn: async ({ id, level }: SaveRequest) =>
      readData(
        id === null
          ? await apiClient.POST("/levels/custom", { body: { level } })
          : await apiClient.PUT("/levels/custom/{id}", {
              params: { path: { id } },
              body: { level },
            }),
      ),
  });

export const deleteCustomLevelMutationOptions = () =>
  mutationOptions({
    mutationKey: ["custom-levels", "delete"],
    mutationFn: async (id: string) =>
      readEmpty(await apiClient.DELETE("/levels/custom/{id}", { params: { path: { id } } })),
  });
