import { Pressable, View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { Text } from "@shared/ui/text";

import StarIcon from "@assets/icons/play/star.svg";

import type { CalendarCell as CalendarCellData } from "../model/calendar-weeks";

import { styles } from "./calendar-cell-styles";

interface ICalendarCell {
  cell: CalendarCellData;
  label: string;
  onPress?: () => void;
}

const DAY_OF_MONTH_START = 8;

const variantOf = (cell: CalendarCellData) => {
  if (cell === null) return "padding";
  return cell.isWon ? "won" : "none";
};

const CalendarCell = ({ cell, label, onPress }: ICalendarCell) => {
  const { theme } = useUnistyles();
  styles.useVariants({
    result: variantOf(cell),
    isToday: cell?.isToday === true,
  });
  const iconSize = theme.sizes.icon.s;

  if (cell === null) return <View style={styles.cell} />;

  const content = (
    <>
      {cell.isWon ? (
        <StarIcon width={iconSize} height={iconSize} color={theme.colors.text.onAccent} />
      ) : null}
      {cell.isToday && !cell.isWon ? (
        <Text variant="caption">{Number(cell.dayKey.slice(DAY_OF_MONTH_START))}</Text>
      ) : null}
    </>
  );
  return onPress === undefined ? (
    <View style={styles.cell} accessible accessibilityLabel={label}>
      {content}
    </View>
  ) : (
    <Pressable
      style={styles.cell}
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
    >
      {content}
    </Pressable>
  );
};

export default CalendarCell;
