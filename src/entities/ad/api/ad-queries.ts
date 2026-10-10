import { queryOptions, useQuery } from "@tanstack/react-query";

import { apiClient, readData } from "@shared/api";

import type { AdPlacement } from "../model/ad-type";

const LIMITS_STALE_MS = 60_000;

export const adKeys = {
  all: ["ad"] as const,
  limits: () => [...adKeys.all, "limits"] as const,
};

export const adLimitsQueryOptions = () =>
  queryOptions({
    queryKey: adKeys.limits(),
    queryFn: async () => readData(await apiClient.GET("/ads/limits")),
    staleTime: LIMITS_STALE_MS,
  });

export const useAdLimitsQuery = () => useQuery(adLimitsQueryOptions());

export const requestAdIntent = async (placement: AdPlacement, ref?: string) =>
  readData(
    await apiClient.POST("/ads/intent", {
      body: { placement, ...(ref === undefined ? {} : { ref }) },
    }),
  );

export const fetchAdIntentStatus = async (id: string) =>
  readData(await apiClient.GET("/ads/intent/{id}", { params: { path: { id } } }));
