import { mutationOptions } from "@tanstack/react-query";

import { apiClient, readData } from "@shared/api";

import type { MapValidation, PvpMap } from "../model/arena-map-type";

interface ValidateRequest {
  format: number;
  map: PvpMap;
}

export const validateArenaMapMutationOptions = () =>
  mutationOptions({
    mutationKey: ["arena-map", "validate"],
    mutationFn: async (body: ValidateRequest) =>
      // openapi-fetch widens response tuples to number[][] (openapi-fetch расширяет кортежи ответа до number[][]).
      readData(await apiClient.POST("/arena/maps/validate", { body })) as MapValidation,
  });
