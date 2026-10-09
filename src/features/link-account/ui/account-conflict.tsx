import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { Button } from "@shared/ui/button";
import { Dialog } from "@shared/ui/dialog";
import { IconButton } from "@shared/ui/icon-button";
import { Text } from "@shared/ui/text";

import ChevronLeftIcon from "@assets/icons/levels/chevron-left.svg";

import type { ProgressCard } from "../model/progress-card";

import { styles } from "./account-conflict-styles";
import ConflictCard from "./conflict-card";

interface IAccountConflict {
  device: ProgressCard | null;
  saved: ProgressCard;
  isPending: boolean;
  onLoad: () => void;
  onCancel: () => void;
}

const AccountConflict = ({ device, saved, isPending, onLoad, onCancel }: IAccountConflict) => {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const [isConfirming, setIsConfirming] = useState(false);
  const iconSize = theme.sizes.iconButton.icon;

  const handleKeep = () => {
    setIsConfirming(false);
    onLoad();
  };

  return (
    <View style={styles.conflict}>
      <View style={styles.header}>
        <IconButton
          icon={
            <ChevronLeftIcon width={iconSize} height={iconSize} color={theme.colors.text.primary} />
          }
          accessibilityLabel={t("common.back")}
          onPress={onCancel}
        />
        <Text variant="title.s" style={styles.headerTitle}>
          {t("account.conflict.header")}
        </Text>
        <View style={styles.headerSpacer} />
      </View>
      <Text variant="display.m" accessibilityRole="header" style={styles.title}>
        {t("account.conflict.title")}
      </Text>
      <Text variant="body.m" style={styles.description}>
        {t("account.conflict.description")}
      </Text>
      {device === null ? null : (
        <ConflictCard kind={t("account.conflict.thisDevice")} card={device} />
      )}
      <ConflictCard kind={t("account.conflict.saved")} card={saved} />
      <View style={styles.actions}>
        <Button
          testID="conflict-load"
          label={t("account.conflict.load")}
          onPress={() => setIsConfirming(true)}
          variant="primary"
          size="l"
          isDisabled={isPending}
        />
        <Button label={t("common.cancel")} onPress={onCancel} variant="ghost" />
      </View>
      <Dialog
        isOpen={isConfirming}
        title={t("account.conflict.confirmTitle", { name: saved.name })}
        message={
          device === null ? undefined : t("account.conflict.confirmMessage", { name: device.name })
        }
        onCancel={() => setIsConfirming(false)}
        actions={[
          { label: t("common.back"), variant: "secondary", onPress: () => setIsConfirming(false) },
          { label: t("account.conflict.keep"), variant: "primary", onPress: handleKeep },
        ]}
      />
    </View>
  );
};

export default AccountConflict;
