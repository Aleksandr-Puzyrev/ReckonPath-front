import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { StreakRestoreCard } from "@features/restore-streak";
import type { RestoreCallbacks, RestoreOffer } from "@features/restore-streak";
import { Text } from "@shared/ui/text";

import { styles } from "./daily-streak-notice-styles";

interface IDailyStreakNotice extends RestoreCallbacks {
  offer: RestoreOffer;
  restoredDays: number | null;
}

const DailyStreakNotice = ({
  offer,
  restoredDays,
  onRestored,
  onShortOfEmeralds,
  onError,
}: IDailyStreakNotice) => {
  const { t } = useTranslation();

  if (restoredDays !== null) {
    return (
      <View style={styles.card}>
        <Text variant="title.s">{t("streak.restored")}</Text>
        <Text variant="body.s" style={styles.secondary}>
          {t("streak.restoredNote")}
        </Text>
      </View>
    );
  }
  if (offer === null) return null;
  return (
    <StreakRestoreCard
      offer={offer}
      onRestored={onRestored}
      onShortOfEmeralds={onShortOfEmeralds}
      onError={onError}
    />
  );
};

export default DailyStreakNotice;
