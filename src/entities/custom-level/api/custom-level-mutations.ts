import { mutationOptions } from "@tanstack/react-query";

import { apiClient, readData, readEmpty } from "@shared/api";

import type { CustomDraft } from "../model/custom-level-type";
import { customLevelRequestOf } from "../model/custom-level-wire";

interface SaveRequest {
  id: string | null;
  draft: CustomDraft;
  norm: number | null;
}

export const saveCustomLevelMutationOptions = () =>
  mutationOptions({
    mutationKey: ["custom-levels", "save"],
    mutationFn: async ({ id, draft, norm }: SaveRequest) => {
      const body = customLevelRequestOf(draft, norm);
      return readData(
        id === null
          ? await apiClient.POST("/levels/custom", { body })
          : await apiClient.PUT("/levels/custom/{id}", { params: { path: { id } }, body }),
      );
    },
  });

export const deleteCustomLevelMutationOptions = () =>
  mutationOptions({
    mutationKey: ["custom-levels", "delete"],
    mutationFn: async (id: string) =>
      readEmpty(await apiClient.DELETE("/levels/custom/{id}", { params: { path: { id } } })),
  });
