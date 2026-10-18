import { mutationOptions } from "@tanstack/react-query";

import { apiClient, readData } from "@shared/api";

import type { ArenaMap, ArenaMapInput } from "../model/arena-map-type";

interface SaveRequest {
  id: string | null;
  input: ArenaMapInput;
}

export const saveArenaMapMutationOptions = () =>
  mutationOptions({
    mutationKey: ["arena-map", "save"],
    mutationFn: async ({ id, input }: SaveRequest) =>
      // openapi-fetch widens response tuples to number[][] (openapi-fetch расширяет кортежи ответа до number[][]).
      readData(
        id === null
          ? await apiClient.POST("/arena/maps", { body: input })
          : await apiClient.PUT("/arena/maps/{id}", { params: { path: { id } }, body: input }),
      ) as ArenaMap,
  });
