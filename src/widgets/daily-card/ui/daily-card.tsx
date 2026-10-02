import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { useDailyRecordStore } from "@entities/daily";
import { streakForecastOf, useStreakQuery } from "@entities/streak";
import {
  DAILY_UNLOCK_LEVEL,
  NextDailyCountdown,
  useDailyToday,
  useIsDailyUnlocked,
} from "@features/daily-today";
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
  const isUnlocked = useIsDailyUnlocked();
  const { todayKey, yesterdayKey } = useDailyToday();
  const record = useDailyRecordStore((state) => state.days[todayKey]);
  const { data } = useStreakQuery();
  const streak = streakForecastOf(data, {
    todayKey,
    yesterdayKey,
    hasCountedToday: record !== undefined,
  });
  const iconSize = theme.sizes.icon.xl;

  const statusText = () => {
    if (!isUnlocked) return t("daily.locked", { n: DAILY_UNLOCK_LEVEL });
    if (record === undefined) return t("daily.notPlayed");
    const moves = t("daily.moves", { count: record.movesUsed });
    return record.rank === null
      ? t("daily.doneNoRank", { moves })
      : t("daily.done", { moves, rank: record.rank });
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
      {isUnlocked ? (
        <View style={styles.streak}>
          <FlameIcon width={iconSize} height={iconSize} color={theme.colors.feedback.warm} />
          <Text variant="title.m">{streak.current}</Text>
          <Text variant="caption" style={styles.secondary}>
            {t("streak.daysShort", { count: streak.current })}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
};

export default DailyCard;
