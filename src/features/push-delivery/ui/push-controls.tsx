import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Linking, View } from "react-native";
import { uuidv7 } from "uuidv7";

import { deviceKeys } from "@entities/device";
import { useSettingsStore } from "@entities/settings";
import {
  apiClient,
  clearCurrentPushTokens,
  errorMessageKey,
  readData,
  runCurrentPushOperation,
  useIsOnline,
} from "@shared/api";
import { Button } from "@shared/ui/button";
import { Text } from "@shared/ui/text";

import { setUpNativeDelivery } from "../model/native-push";

import { styles } from "./push-controls-styles";

const PushControls = () => {
  const { t } = useTranslation();
  const client = useQueryClient();
  const enabled = useSettingsStore((state) => state.isPushDeliveryEnabled);
  const setEnabled = useSettingsStore((state) => state.setPushDelivery);
  const online = useIsOnline();
  const [denied, setDenied] = useState(false);
  const enable = useMutation({
    networkMode: "always",
    mutationFn: () => setUpNativeDelivery(t("deviceNotifications.title"), true, () => true),
    onSuccess: (result) => {
      setDenied(result === "permissionDenied");
      if (result === "registered") {
        setEnabled(true);
        void client.invalidateQueries({ queryKey: deviceKeys.all });
      }
    },
  });

  const disable = useMutation({
    networkMode: "always",
    onMutate: () => setEnabled(false),
    mutationFn: () => runCurrentPushOperation(clearCurrentPushTokens),
    onError: () => setEnabled(true),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: deviceKeys.all });
    },
  });

  const test = useMutation({
    networkMode: "always",
    mutationFn: async () => {
      if (!__DEV__) return null;
      return runCurrentPushOperation(async () =>
        readData(
          await apiClient.POST("/me/devices/current/test-push", {
            headers: { "Idempotency-Key": uuidv7() },
          }),
        ),
      );
    },
  });

  const handleDelivery = () => {
    setDenied(false);
    enable.reset();
    disable.reset();
    test.reset();
    if (enabled) disable.mutate();
    else enable.mutate();
  };

  const busy = !online || enable.isPending || disable.isPending || test.isPending;
  const error = enable.error ?? disable.error ?? test.error;

  return (
    <View style={styles.controls}>
      <Button
        label={t(enabled ? "deviceNotifications.disablePush" : "deviceNotifications.enablePush")}
        isDisabled={busy}
        onPress={handleDelivery}
      />
      {denied && (
        <>
          <Text variant="body.s">{t("deviceNotifications.systemDisabled")}</Text>
          <Button
            label={t("deviceNotifications.openSettings")}
            onPress={() => void Linking.openSettings()}
          />
        </>
      )}
      {__DEV__ && enabled && (
        <Button
          label={t("deviceNotifications.testPush")}
          isDisabled={busy}
          onPress={() => test.mutate()}
        />
      )}
      {test.data && (
        <Text variant="body.s" accessibilityLiveRegion="polite">
          {t(
            test.data.sent > 0 ? "deviceNotifications.testSent" : "deviceNotifications.testNotSent",
          )}
        </Text>
      )}
      {error !== null && (
        <Text variant="body.s" accessibilityLiveRegion="polite">
          {t(errorMessageKey(error))}
        </Text>
      )}
    </View>
  );
};

export default PushControls;
