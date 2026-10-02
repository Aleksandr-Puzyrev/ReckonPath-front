import { queryOptions, useQuery } from "@tanstack/react-query";

import { apiClient, readData } from "@shared/api";

const BOOTSTRAP_STALE_MS = 5 * 60_000;
const NO_OFFSET = 0;

export const appConfigKeys = {
  all: ["app-config"] as const,
  bootstrap: () => [...appConfigKeys.all, "bootstrap"] as const,
};

const fetchBootstrap = async () => {
  const bootstrap = readData(await apiClient.GET("/bootstrap"));
  // Measured when the answer arrives; the cached value keeps the offset of that moment (замеряется в момент ответа; кэш хранит поправку того момента).
  return { ...bootstrap, clockOffsetMs: Date.parse(bootstrap.serverTime) - Date.now() };
};

export const bootstrapQueryOptions = () =>
  queryOptions({
    queryKey: appConfigKeys.bootstrap(),
    queryFn: fetchBootstrap,
    staleTime: BOOTSTRAP_STALE_MS,
  });

export const useBootstrapQuery = () => useQuery(bootstrapQueryOptions());

export const useClockOffset = () =>
  useQuery({ ...bootstrapQueryOptions(), select: ({ clockOffsetMs }) => clockOffsetMs }).data ??
  NO_OFFSET;
