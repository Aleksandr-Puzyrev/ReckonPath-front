import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { Button } from "@shared/ui/button";
import { Text } from "@shared/ui/text";

import EmeraldIcon from "@assets/icons/play/emerald.svg";
import VideoIcon from "@assets/icons/play/video.svg";

import type { RestoreOffer } from "../model/restore-offer";
import { useRestoreStreak } from "../model/use-restore-streak";
import type { RestoreCallbacks } from "../model/use-restore-streak";

import { styles } from "./streak-restore-card-styles";

interface IStreakRestoreCard extends RestoreCallbacks {
  offer: NonNullable<RestoreOffer>;
}

const HOUR_MS = 3_600_000;
const NO_PRICE = 0;
const ignorePress = () => undefined;

const StreakRestoreCard = ({
  offer,
  onRestored,
  onShortOfEmeralds,
  onError,
}: IStreakRestoreCard) => {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const [openedAt] = useState(Date.now);
  const restore = useRestoreStreak(offer.kind === "restorable" ? offer.price : NO_PRICE, {
    onRestored,
    onShortOfEmeralds,
    onError,
  });
  const iconSize = theme.sizes.icon.l;

  if (offer.kind === "weekly") {
    return (
      <View style={styles.card}>
        <Text variant="title.s">{t("streak.lost", { count: offer.lost })}</Text>
        <Text variant="body.s" style={styles.secondary}>
          {t("streak.weekly")}
        </Text>
      </View>
    );
  }

  const hoursLeft =
    offer.restoreUntil === null
      ? null
      : Math.max(1, Math.ceil((Date.parse(offer.restoreUntil) - openedAt) / HOUR_MS));

  return (
    <View style={styles.card}>
      <Text variant="title.s">{t("streak.lost", { count: offer.lost })}</Text>
      {hoursLeft === null ? null : (
        <Text variant="body.s" style={styles.secondary}>
          {t("streak.restoreLeft", { hours: hoursLeft })}
        </Text>
      )}
      <View style={styles.actions}>
        <View style={styles.action}>
          {/* TODO: restore for a rewarded ad once the ads SDK exists (stage 3) */}
          <Button
            label={t("streak.restoreAd")}
            caption={t("ads.unavailable")}
            icon={
              <VideoIcon width={iconSize} height={iconSize} color={theme.colors.text.disabled} />
            }
            isDisabled
            onPress={ignorePress}
          />
        </View>
        <View style={styles.action}>
          <Button
            testID="restore-emeralds"
            label={String(offer.price)}
            accessibilityLabel={t("streak.restore")}
            icon={<EmeraldIcon width={iconSize} height={iconSize} />}
            isLabelDanger={!restore.canAfford}
            isDisabled={restore.isPending}
            onPress={restore.handleRestore}
          />
        </View>
      </View>
    </View>
  );
};

export default StreakRestoreCard;
