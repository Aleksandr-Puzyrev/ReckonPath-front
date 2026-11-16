import { mutationOptions } from "@tanstack/react-query";

import { apiClient, readData, readEmpty } from "@shared/api";

import type { PvpMap } from "../model/arena-map-type";
import { arenaMapOf, gameLevelOfMap, mapOfLevel } from "../model/level-of-map";

interface SaveRequest {
  id: string | null;
  name: string;
  map: PvpMap;
}

export const saveArenaMapMutationOptions = () =>
  mutationOptions({
    mutationKey: ["arena-map", "save"],
    mutationFn: async ({ id, name, map }: SaveRequest) => {
      const body = { name, level: gameLevelOfMap(map) };
      const view = readData(
        id === null
          ? await apiClient.POST("/arena/maps", { body })
          : await apiClient.PUT("/arena/maps/{id}", { params: { path: { id } }, body }),
      );
      return arenaMapOf(view);
    },
  });

export const deleteArenaMapMutationOptions = () =>
  mutationOptions({
    mutationKey: ["arena-map", "delete"],
    mutationFn: async (id: string) =>
      readEmpty(await apiClient.DELETE("/arena/maps/{id}", { params: { path: { id } } })),
  });

export const activateArenaMapMutationOptions = () =>
  mutationOptions({
    mutationKey: ["arena-map", "activate"],
    mutationFn: async (id: string) =>
      arenaMapOf(
        readData(await apiClient.POST("/arena/maps/{id}/activate", { params: { path: { id } } })),
      ),
  });

export const randomArenaMapMutationOptions = () =>
  mutationOptions({
    mutationKey: ["arena-map", "random"],
    mutationFn: async () => mapOfLevel(readData(await apiClient.POST("/arena/maps/random")).level),
  });

export const checkArenaMapMutationOptions = () =>
  mutationOptions({
    mutationKey: ["arena-map", "check"],
    mutationFn: async (map: PvpMap) =>
      readData(await apiClient.POST("/arena/maps/check", { body: { level: gameLevelOfMap(map) } })),
  });
