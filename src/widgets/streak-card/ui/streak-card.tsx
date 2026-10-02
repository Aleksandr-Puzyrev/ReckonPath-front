import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { STREAK_MILESTONES } from "@entities/streak";
import type { StreakForecast } from "@entities/streak";
import { Text } from "@shared/ui/text";

import FlameIcon from "@assets/icons/daily/flame.svg";

import { milestoneStatesOf, trackShareOf } from "../model/milestone-track";

import MilestoneBadge from "./milestone-badge";
import { styles } from "./streak-card-styles";

interface IStreakCard {
  streak: StreakForecast;
}

const PERCENT = 100;

const StreakCard = ({ streak }: IStreakCard) => {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const iconSize = theme.sizes.iconButton.size;
  const states = milestoneStatesOf(streak.current, STREAK_MILESTONES);
  const share = trackShareOf(streak.current, STREAK_MILESTONES);

  return (
    <View
      style={styles.card}
      accessible
      accessibilityLabel={t("streak.days", { count: streak.current })}
    >
      <View style={styles.summary}>
        <FlameIcon width={iconSize} height={iconSize} color={theme.colors.feedback.warm} />
        <View>
          <Text variant="display.m">{streak.current}</Text>
          <Text variant="body.s" style={styles.secondary}>
            {streak.lost === null
              ? t("streak.best", { count: streak.best })
              : t("streak.was", { count: streak.lost, best: streak.best })}
          </Text>
        </View>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${share * PERCENT}%` }]} />
      </View>
      <View style={styles.milestones}>
        {STREAK_MILESTONES.map((milestone, index) => (
          <MilestoneBadge
            key={milestone.days}
            milestone={milestone}
            state={states[index] ?? "ahead"}
          />
        ))}
      </View>
    </View>
  );
};

export default StreakCard;
