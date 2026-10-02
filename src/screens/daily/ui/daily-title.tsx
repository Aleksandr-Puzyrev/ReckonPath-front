import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { NextDailyCountdown } from "@features/daily-today";
import { formatDayMonth, formatWeekday } from "@shared/lib";
import { Text } from "@shared/ui/text";

import { styles } from "./daily-title-styles";

interface IDailyTitle {
  todayKey: string;
}

const DailyTitle = ({ todayKey }: IDailyTitle) => {
  const { t, i18n } = useTranslation();

  return (
    <View>
      <Text variant="eyebrow" style={styles.eyebrow}>
        {t("daily.dateLine", {
          date: formatDayMonth(todayKey, i18n.language),
          weekday: formatWeekday(todayKey, i18n.language),
        })}
      </Text>
      <View style={styles.row}>
        <Text variant="display.m" accessibilityRole="header">
          {t("daily.title")}
        </Text>
        <NextDailyCountdown textKey="daily.nextShort" variant="caption" style={styles.countdown} />
      </View>
    </View>
  );
};

export default DailyTitle;
