import { mutationOptions } from "@tanstack/react-query";

import { apiClient, readData } from "@shared/api";

import type { PvpMap } from "../model/arena-map-type";

interface RandomMap {
  map: PvpMap;
  botNorm: number;
}

export const randomArenaMapMutationOptions = () =>
  mutationOptions({
    mutationKey: ["arena-map", "random"],
    mutationFn: async (format: number) =>
      // openapi-fetch widens response tuples to number[][] (openapi-fetch расширяет кортежи ответа до number[][]).
      readData(await apiClient.POST("/arena/maps/random", { body: { format } })) as RandomMap,
  });
