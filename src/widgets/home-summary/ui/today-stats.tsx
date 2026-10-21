import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { Text } from "@shared/ui/text";

import type { TodayStat } from "../model/home-summary-type";

import { styles } from "./home-summary-styles";

interface ITodayStats {
  stats: readonly TodayStat[];
  note: string | null;
}

const TodayStats = ({ stats, note }: ITodayStats) => {
  const { t } = useTranslation();

  return (
    <View style={styles.today}>
      <View style={styles.todayHead}>
        <Text variant="eyebrow" style={styles.secondary} accessibilityRole="header">
          {t("home.today")}
        </Text>
        {note === null ? null : (
          <Text variant="caption" style={styles.secondary}>
            {note}
          </Text>
        )}
      </View>
      <View style={styles.stats}>
        {stats.map((stat) => (
          <View
            key={stat.key}
            style={styles.stat}
            testID={`today-${stat.key}`}
            accessible
            accessibilityLabel={`${stat.label}: ${stat.value}`}
          >
            <Text variant="caption" style={styles.secondary}>
              {stat.label}
            </Text>
            <Text variant="number.counter">{stat.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default TodayStats;
