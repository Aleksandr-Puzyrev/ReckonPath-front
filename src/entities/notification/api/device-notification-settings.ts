import {
  mutationOptions,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";
import { uuidv7 } from "uuidv7";

import { apiClient, readData, useHasAccount } from "@shared/api";
import type { components } from "@shared/api";
import { HAS_BACKEND } from "@shared/config";

type Settings = components["schemas"]["DeviceNotificationSettings"];
export type NotificationChannel = components["schemas"]["NotificationChannel"];

const KEY = ["deviceNotificationSettings"] as const;
export const updateDeviceNotificationKey = [...KEY, "update"] as const;

export const notificationDeviceOptions = () =>
  queryOptions({
    queryKey: KEY,
    queryFn: async ({ signal }) =>
      readData(await apiClient.GET("/me/devices/current/notifications", { signal })),
    staleTime: 30_000,
  });

type DeviceMetadata = Pick<Settings, "tz" | "locale">;

type SettingsChange = DeviceMetadata & { channel?: NotificationChannel };

export const updateDeviceNotificationOptions = (client: QueryClient) =>
  mutationOptions({
    mutationKey: updateDeviceNotificationKey,
    scope: { id: KEY[0] },
    networkMode: "always",
    mutationFn: async ({ channel, ...metadata }: SettingsChange) => {
      await client.cancelQueries({ queryKey: KEY, exact: true });
      const current = client.getQueryData(notificationDeviceOptions().queryKey);
      if (current === undefined) return;
      if (channel === undefined && current.locale === metadata.locale && current.tz === metadata.tz)
        return;
      const channels =
        channel === undefined
          ? current.channels
          : current.channels.includes(channel)
            ? current.channels.filter((value) => value !== channel)
            : [...current.channels, channel];
      const updated = readData(
        await apiClient.PUT("/me/devices/current/notifications", {
          body: { ...metadata, channels },
          headers: { "Idempotency-Key": uuidv7() },
        }),
      );
      client.setQueryData(notificationDeviceOptions().queryKey, (latest) =>
        latest === current ? updated : latest,
      );
    },
  });

export const useDeviceNotificationSettings = () => {
  const hasAccount = useHasAccount();
  return useQuery({ ...notificationDeviceOptions(), enabled: HAS_BACKEND && hasAccount });
};

export const useUpdateDeviceNotifications = () => {
  const client = useQueryClient();
  return useMutation(updateDeviceNotificationOptions(client));
};

export const deviceNotificationTimeZone = () =>
  Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
