import { useIsMutating } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AppState } from "react-native";

import {
  deviceNotificationTimeZone,
  updateDeviceNotificationKey,
  useDeviceNotificationSettings,
  useUpdateDeviceNotifications,
} from "@entities/notification";
import { useIsOnline } from "@shared/api";
import { resolveLanguage } from "@shared/i18n";

const DeviceNotificationHost = () => {
  const { i18n } = useTranslation();
  const { data } = useDeviceNotificationSettings();
  const { mutate, reset, isError, variables } = useUpdateDeviceNotifications();
  const online = useIsOnline();
  const busy = useIsMutating({ mutationKey: updateDeviceNotificationKey }) > 0;
  const [tz, setTimeZone] = useState(deviceNotificationTimeZone);
  const locale = resolveLanguage(i18n.language);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state !== "active") return;
      setTimeZone(deviceNotificationTimeZone());
      reset();
    });
    return () => subscription.remove();
  }, [reset]);

  useEffect(() => {
    if (data === undefined || !online || busy || (data.tz === tz && data.locale === locale)) return;
    if (isError && variables?.tz === tz && variables.locale === locale) return;
    mutate({ tz, locale });
  }, [busy, data, isError, locale, mutate, online, tz, variables]);

  return null;
};

export default DeviceNotificationHost;
