import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { formatDayMonth, mondayFirstWeekdays } from "@shared/lib";
import { Text } from "@shared/ui/text";

import { calendarWeeksOf } from "../model/calendar-weeks";
import type { CalendarCell as CalendarCellData } from "../model/calendar-weeks";

import CalendarCell from "./calendar-cell";
import { styles } from "./daily-calendar-styles";

interface IDailyCalendar {
  todayKey: string;
  wonDays: ReadonlySet<string>;
}

const DailyCalendar = ({ todayKey, wonDays }: IDailyCalendar) => {
  const { t, i18n } = useTranslation();
  const weeks = calendarWeeksOf(todayKey, wonDays);
  const weekdays = mondayFirstWeekdays(i18n.language);

  const labelOf = (cell: CalendarCellData) => {
    if (cell === null) return "";
    const date = formatDayMonth(cell.dayKey, i18n.language);
    return cell.isWon ? `${date}, ${t("daily.won")}` : date;
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text variant="eyebrow">{t("daily.calendar")}</Text>
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={styles.legendWon} />
            <Text variant="caption" style={styles.secondary}>
              {t("daily.won")}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.weeks}>
        <View style={styles.week}>
          {weekdays.map((weekday, index) => (
            // Weekday letters repeat («П», «С»), so their position is the key (буквы дней повторяются, поэтому ключ — позиция).
            <Text key={index} variant="caption" style={styles.weekday}>
              {weekday}
            </Text>
          ))}
        </View>
        {weeks.map((week) => (
          <View key={week.find((cell) => cell !== null)?.dayKey} style={styles.week}>
            {week.map((cell, index) => (
              <CalendarCell
                key={cell?.dayKey ?? `padding-${index}`}
                cell={cell}
                label={labelOf(cell)}
              />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
};

export default DailyCalendar;
