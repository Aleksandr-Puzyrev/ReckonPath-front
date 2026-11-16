import { mutationOptions } from "@tanstack/react-query";

import { apiClient, readData, readEmpty } from "@shared/api";
import type { operations } from "@shared/api";

export type MatchMapSource =
  operations["putMatchMap"]["requestBody"]["content"]["application/json"];

interface TapRequest {
  id: string;
  row: number;
  col: number;
  seq: number;
}

interface MapRequest {
  id: string;
  source: MatchMapSource;
}

const pathOf = (id: string) => ({ params: { path: { id } } });

export const joinQueueMutationOptions = () =>
  mutationOptions({
    mutationKey: ["match", "queue", "join"],
    mutationFn: async () => readData(await apiClient.POST("/arena/queue")),
  });

export const leaveQueueMutationOptions = () =>
  mutationOptions({
    mutationKey: ["match", "queue", "leave"],
    mutationFn: async () => readEmpty(await apiClient.DELETE("/arena/queue")),
  });

export const startMapMatchMutationOptions = () =>
  mutationOptions({
    mutationKey: ["match", "map-match"],
    mutationFn: async () => readData(await apiClient.POST("/arena/map-match")),
  });

export const chooseMatchMapMutationOptions = () =>
  mutationOptions({
    mutationKey: ["match", "map"],
    mutationFn: async ({ id, source }: MapRequest) =>
      readData(await apiClient.PUT("/arena/matches/{id}/map", { ...pathOf(id), body: source })),
  });

export const readyMatchMutationOptions = () =>
  mutationOptions({
    mutationKey: ["match", "ready"],
    mutationFn: async (id: string) =>
      readData(await apiClient.POST("/arena/matches/{id}/ready", pathOf(id))),
  });

export const tapMatchMutationOptions = () =>
  mutationOptions({
    mutationKey: ["match", "tap"],
    mutationFn: async ({ id, row, col, seq }: TapRequest) =>
      readData(
        await apiClient.POST("/arena/matches/{id}/tap", { ...pathOf(id), body: { row, col, seq } }),
      ),
  });

export const surrenderMatchMutationOptions = () =>
  mutationOptions({
    mutationKey: ["match", "surrender"],
    mutationFn: async (id: string) =>
      readData(await apiClient.POST("/arena/matches/{id}/surrender", pathOf(id))),
  });
