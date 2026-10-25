import { queryOptions, useQuery } from "@tanstack/react-query";
import { useSyncExternalStore } from "react";

import { apiClient, readData, serverClockOffset, subscribeServerClock } from "@shared/api";

const BOOTSTRAP_STALE_MS = 5 * 60_000;

export const appConfigKeys = {
  all: ["app-config"] as const,
  bootstrap: () => [...appConfigKeys.all, "bootstrap"] as const,
};

const fetchBootstrap = async () => readData(await apiClient.GET("/bootstrap"));

export const bootstrapQueryOptions = () =>
  queryOptions({
    queryKey: appConfigKeys.bootstrap(),
    queryFn: fetchBootstrap,
    staleTime: BOOTSTRAP_STALE_MS,
  });

export const useBootstrapQuery = () => useQuery(bootstrapQueryOptions());

export const useClockOffset = () => useSyncExternalStore(subscribeServerClock, serverClockOffset);
