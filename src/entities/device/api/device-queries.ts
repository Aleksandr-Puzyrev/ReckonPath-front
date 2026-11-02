import { queryOptions, useQuery } from "@tanstack/react-query";

import { apiClient, readData, useHasAccount } from "@shared/api";
import type { components } from "@shared/api";

export type Device = components["schemas"]["Device"];

const DEVICES_STALE_MS = 30_000;

export const deviceKeys = {
  all: ["devices"] as const,
};

export const devicesQueryOptions = () =>
  queryOptions({
    queryKey: deviceKeys.all,
    queryFn: async () => readData(await apiClient.GET("/me/devices")).devices,
    staleTime: DEVICES_STALE_MS,
  });

export const useDevicesQuery = () =>
  useQuery({ ...devicesQueryOptions(), enabled: useHasAccount() });
