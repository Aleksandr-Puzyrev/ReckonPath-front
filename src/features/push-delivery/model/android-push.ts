import type * as Notifications from "expo-notifications";

import { clearCurrentFcmToken, registerCurrentFcmToken } from "@shared/api";

import { isFcmToken } from "./push-token";

export const ANDROID_NOTIFICATION_CHANNEL = "default";

export const loadAndroidNotifications = (): typeof Notifications => {
  // Other platforms and Android builds without Firebase never load the native module.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require("expo-notifications") as typeof Notifications;
};

export const setUpAndroidDelivery = async (
  label: string,
  shouldPrompt: boolean,
  isAllowed: () => boolean,
) => {
  const notifications = loadAndroidNotifications();
  await notifications.setNotificationChannelAsync(ANDROID_NOTIFICATION_CHANNEL, {
    name: label,
    importance: notifications.AndroidImportance.DEFAULT,
  });
  const existing = await notifications.getPermissionsAsync();
  const permission =
    shouldPrompt && !existing.granted && existing.canAskAgain
      ? await notifications.requestPermissionsAsync()
      : existing;

  if (!permission.granted) {
    await clearCurrentFcmToken(isAllowed);
    return "permissionDenied" as const;
  }
  if (!isAllowed()) return "cancelled" as const;

  const token = await notifications.getDevicePushTokenAsync();
  if (token.type !== "android" || !isFcmToken(token.data)) {
    throw new Error("Invalid Android push token");
  }
  return (await registerCurrentFcmToken(token.data, isAllowed))
    ? ("registered" as const)
    : ("cancelled" as const);
};
