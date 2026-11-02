import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { Button } from "@shared/ui/button";
import { Dialog } from "@shared/ui/dialog";
import { IconButton } from "@shared/ui/icon-button";
import { Screen } from "@shared/ui/screen";
import { Text } from "@shared/ui/text";
import { Toast } from "@shared/ui/toast";
import type { ToastMessage } from "@shared/ui/toast";

import ChevronLeftIcon from "@assets/icons/levels/chevron-left.svg";

import { useDevicesScreen } from "../model/use-devices-screen";

import DeviceRow from "./device-row";
import DevicesStatus from "./devices-status";
import { styles } from "./devices-styles";

const DevicesScreen = () => {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const showToast = (text: string) => setToast((current) => ({ id: (current?.id ?? 0) + 1, text }));
  const screen = useDevicesScreen(showToast);
  const iconSize = theme.sizes.iconButton.icon;

  return (
    <Screen style={styles.screen}>
      <View style={styles.top}>
        <IconButton
          accessibilityLabel={t("common.back")}
          onPress={() => router.back()}
          icon={
            <ChevronLeftIcon width={iconSize} height={iconSize} color={theme.colors.text.primary} />
          }
        />
        <Text variant="title.m" accessibilityRole="header" style={styles.title}>
          {t("devices.title")}
        </Text>
        <View style={styles.side} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          {screen.devices === undefined ? (
            <DevicesStatus
              isPending={screen.isPending}
              isOnline={screen.isOnline}
              onRetry={screen.handleRetry}
            />
          ) : (
            screen.devices.map((device, index) => (
              <DeviceRow
                key={device.id}
                device={device}
                isFirst={index === 0}
                isDisabled={screen.isBusy || !screen.isOnline}
                onRemove={screen.handleRemove}
              />
            ))
          )}
        </View>
        <Button
          testID="devices-sign-out-all"
          label={t("devices.signOutAll")}
          variant="danger"
          size="l"
          isDisabled={screen.isBusy || !screen.isOnline}
          onPress={screen.handleSignOutAll}
        />
      </ScrollView>
      <Dialog
        isOpen={screen.isConfirmOpen}
        title={t("devices.signOutAllTitle")}
        message={t("devices.signOutAllBody")}
        onCancel={screen.handleCancel}
        actions={[
          { label: t("common.cancel"), variant: "secondary", onPress: screen.handleCancel },
          { label: t("devices.signOutAll"), variant: "danger", onPress: screen.handleConfirm },
        ]}
      />
      <Toast message={toast} onHide={() => setToast(null)} />
    </Screen>
  );
};

export default DevicesScreen;
