import { View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { Text } from "@shared/ui/text";

import PlusIcon from "@assets/icons/daily/plus.svg";
import StarIcon from "@assets/icons/play/star.svg";

import type { CalendarCell as CalendarCellData } from "../model/calendar-weeks";

import { styles } from "./calendar-cell-styles";

interface ICalendarCell {
  cell: CalendarCellData;
  label: string;
}

const DAY_OF_MONTH_START = 8;

const CalendarCell = ({ cell, label }: ICalendarCell) => {
  const { theme } = useUnistyles();
  styles.useVariants({
    result: cell === null ? "padding" : (cell.result ?? "none"),
    isToday: cell?.isToday === true,
  });
  const iconSize = theme.sizes.icon.s;

  if (cell === null) return <View style={styles.cell} />;

  return (
    <View style={styles.cell} accessible accessibilityLabel={label}>
      {cell.result === "won" ? (
        <StarIcon width={iconSize} height={iconSize} color={theme.colors.text.onAccent} />
      ) : null}
      {cell.result === "restored" ? (
        <PlusIcon width={iconSize} height={iconSize} color={theme.colors.accent.cyan} />
      ) : null}
      {cell.isToday && cell.result === null ? (
        <Text variant="caption">{Number(cell.dayKey.slice(DAY_OF_MONTH_START))}</Text>
      ) : null}
    </View>
  );
};

export default CalendarCell;
