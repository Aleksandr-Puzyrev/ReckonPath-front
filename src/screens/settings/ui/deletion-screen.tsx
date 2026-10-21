import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { useRestoreAccount } from "@features/delete-account";
import { useMeQuery } from "@entities/wallet";
import { formatDayMonth } from "@shared/lib";
import { Button } from "@shared/ui/button";
import { IconButton } from "@shared/ui/icon-button";
import { Screen } from "@shared/ui/screen";
import { SystemIllustration } from "@shared/ui/system-illustration";
import { Text } from "@shared/ui/text";
import { Toast } from "@shared/ui/toast";
import type { ToastMessage } from "@shared/ui/toast";

import ChevronLeftIcon from "@assets/icons/levels/chevron-left.svg";
import DeleteIcon from "@assets/icons/settings/delete.svg";

import { styles } from "./settings-styles";

const DeletionScreen = () => {
  const { t, i18n } = useTranslation();
  const { data: me } = useMeQuery();
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const account = useRestoreAccount(
    () => router.back(),
    (messageKey) => setToast((current) => ({ id: (current?.id ?? 0) + 1, text: t(messageKey) })),
  );
  const { theme } = useUnistyles();
  const iconSize = theme.sizes.iconButton.icon;
  const deletionAt = me?.flags.deletionScheduledAt ?? null;

  return (
    <Screen style={styles.screen}>
      <View style={styles.top}>
        <IconButton
          testID="deletion-back"
          accessibilityLabel={t("common.back")}
          onPress={() => router.back()}
          icon={
            <ChevronLeftIcon width={iconSize} height={iconSize} color={theme.colors.text.primary} />
          }
        />
      </View>
      <View style={styles.scheduled}>
        <SystemIllustration tone="danger" Icon={DeleteIcon} />
        {deletionAt === null ? null : (
          <Text variant="display.m" accessibilityRole="header" style={styles.center}>
            {t("settings.delete.scheduledTitle", {
              date: formatDayMonth(deletionAt, i18n.language),
            })}
          </Text>
        )}
        <Text variant="body.m" style={[styles.value, styles.center]}>
          {t("settings.delete.scheduledBody")}
        </Text>
        <Button
          testID="deletion-restore"
          label={t("settings.delete.restore")}
          variant="secondary"
          size="l"
          isDisabled={account.isPending}
          onPress={account.restore}
        />
      </View>
      <Toast message={toast} onHide={() => setToast(null)} />
    </Screen>
  );
};

export default DeletionScreen;
