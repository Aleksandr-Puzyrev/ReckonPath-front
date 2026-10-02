import { queryOptions, useQuery } from "@tanstack/react-query";

import { apiClient, readData } from "@shared/api";

const BOOTSTRAP_STALE_MS = 5 * 60_000;

export const appConfigKeys = {
  all: ["app-config"] as const,
  bootstrap: () => [...appConfigKeys.all, "bootstrap"] as const,
};

export const bootstrapQueryOptions = () =>
  queryOptions({
    queryKey: appConfigKeys.bootstrap(),
    queryFn: async () => readData(await apiClient.GET("/bootstrap")),
    staleTime: BOOTSTRAP_STALE_MS,
  });

export const useBootstrapQuery = () => useQuery(bootstrapQueryOptions());
