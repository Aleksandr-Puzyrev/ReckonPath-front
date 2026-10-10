import { StyleSheet } from "react-native-unistyles";

// Four tiles a row, as design 23.1: the basis leaves room for the gaps, flexGrow fills the rest (четыре плитки в ряд, как в дизайне 23.1: база оставляет место отступам, flexGrow добирает остаток).
const FOUR_IN_ROW_BASIS = "22%";

export const styles = StyleSheet.create((theme) => ({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.space[3],
  },
  tile: {
    flexBasis: FOUR_IN_ROW_BASIS,
    flexGrow: 1,
    gap: theme.space[2],
    alignItems: "center",
  },
  pressed: {
    transform: [{ scale: theme.motion.press.scale }],
  },
  label: {
    textTransform: "uppercase",
    color: theme.colors.text.secondary,
  },
}));
