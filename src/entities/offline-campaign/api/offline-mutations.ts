import { mutationOptions } from "@tanstack/react-query";
import { uuidv7 } from "uuidv7";

import { apiClient, readData } from "@shared/api";
import type { components } from "@shared/api";

import { savePack } from "../model/offline-pack";

type OfflineResult = components["schemas"]["OfflineCampaignResult"];

export const downloadOfflinePackOptions = () =>
  mutationOptions({
    networkMode: "always",
    gcTime: 0,
    mutationFn: async () =>
      savePack(
        readData(
          await apiClient.POST("/campaign/offline/pack", {
            headers: { "Idempotency-Key": uuidv7() },
          }),
        ),
      ),
  });

export const syncOfflineCampaignOptions = () =>
  mutationOptions({
    networkMode: "always",
    mutationFn: async (results: OfflineResult[]) =>
      readData(
        await apiClient.POST("/campaign/offline/sync", {
          body: { results },
          headers: { "Idempotency-Key": uuidv7() },
        }),
      ),
  });
