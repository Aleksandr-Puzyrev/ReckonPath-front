import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AppState } from "react-native";

import { useSettingsStore } from "@entities/settings";
import { registerCurrentFcmToken, useIsOnline } from "@shared/api";

import { setUpNativeDelivery, subscribeNativeFcmToken } from "./native-push";
import { isFcmToken } from "./push-token";

export const usePushRegistration = () => {
  const online = useIsOnline();
  const enabled = useSettingsStore((state) => state.isPushDeliveryEnabled);
  const { t } = useTranslation();
  const label = t("deviceNotifications.title");

  useEffect(() => {
    if (!enabled || !online) return;
    let active = true;
    const isAllowed = () => active && useSettingsStore.getState().isPushDeliveryEnabled;
    const register = () => {
      void setUpNativeDelivery(label, false, isAllowed)
        .then((result) => {
          if (result === "permissionDenied" && isAllowed())
            useSettingsStore.getState().setPushDelivery(false);
        })
        .catch(() => undefined);
    };

    let unsubscribe: () => void;
    try {
      unsubscribe = subscribeNativeFcmToken((token) => {
        if (isFcmToken(token)) {
          void registerCurrentFcmToken(token, isAllowed).catch(() => undefined);
        }
      });
    } catch {
      return;
    }
    const app = AppState.addEventListener("change", (state) => {
      if (state === "active") register();
    });
    register();
    return () => {
      active = false;
      unsubscribe();
      app.remove();
    };
  }, [enabled, label, online]);
};
