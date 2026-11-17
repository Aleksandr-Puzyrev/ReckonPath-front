import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { dayResultOf, todayOf, useDailyQuery } from "@entities/daily";
import { useAccountStore } from "@entities/session";
import { NextDailyCountdown, useDailyToday, useDailyUnlock } from "@features/daily-today";
import { formatDayMonth } from "@shared/lib";
import { Text } from "@shared/ui/text";

import FlameIcon from "@assets/icons/daily/flame.svg";

import { styles } from "./daily-card-styles";

interface IDailyCard {
  onOpen: () => void;
}

const DailyCard = ({ onOpen }: IDailyCard) => {
  const { t, i18n } = useTranslation();
  const { theme } = useUnistyles();
  const { isUnlocked, unlockLevel } = useDailyUnlock();
  const { todayKey } = useDailyToday();
  const { data: daily } = useDailyQuery();
  const hasLogin = useAccountStore((state) => state.hasLogin);
  const day = todayOf(daily?.day, todayKey);
  const result = dayResultOf(day);
  const streak = daily?.streak.current ?? 0;
  const iconSize = theme.sizes.icon.xl;

  const statusText = () => {
    if (!isUnlocked) return t("daily.locked", { n: unlockLevel });
    if (result === null) return t("daily.notPlayed");
    return t("daily.doneNoRank", { moves: t("daily.moves", { count: result.moves }) });
  };

  return (
    <Pressable
      testID="daily-card"
      accessibilityRole="button"
      accessibilityState={{ disabled: !isUnlocked }}
      disabled={!isUnlocked}
      onPress={onOpen}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.text}>
        <Text variant="eyebrow" style={styles.eyebrow}>
          {t("daily.cardEyebrow", { date: formatDayMonth(todayKey, i18n.language) })}
        </Text>
        <Text variant="title.s">{statusText()}</Text>
        {isUnlocked ? (
          <NextDailyCountdown textKey="daily.next" variant="body.s" style={styles.secondary} />
        ) : null}
      </View>
      {isUnlocked && hasLogin ? (
        <View style={styles.streak}>
          <FlameIcon width={iconSize} height={iconSize} color={theme.colors.feedback.warm} />
          <Text variant="title.m">{streak}</Text>
          <Text variant="caption" style={styles.secondary}>
            {t("streak.daysShort", { count: streak })}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
};

export default DailyCard;
