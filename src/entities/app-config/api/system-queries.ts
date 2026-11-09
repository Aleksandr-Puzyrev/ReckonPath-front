import { queryOptions, useQuery } from "@tanstack/react-query";

import { apiClient, readData } from "@shared/api";

import { appConfigKeys } from "./bootstrap-queries";

const SYSTEM_STALE_MS = 5 * 60_000;
const HTTP_NO_CONTENT = 204;

export const versionQueryOptions = () =>
  queryOptions({
    queryKey: appConfigKeys.version(),
    queryFn: async () => readData(await apiClient.GET("/version")),
    staleTime: SYSTEM_STALE_MS,
  });

export const maintenanceQueryOptions = () =>
  queryOptions({
    queryKey: appConfigKeys.maintenance(),
    queryFn: async () => {
      const result = await apiClient.GET("/maintenance");
      return result.response.status === HTTP_NO_CONTENT ? null : readData(result);
    },
    staleTime: SYSTEM_STALE_MS,
  });

export const useVersionQuery = () => useQuery(versionQueryOptions());

export const useMaintenanceQuery = () => useQuery(maintenanceQueryOptions());
