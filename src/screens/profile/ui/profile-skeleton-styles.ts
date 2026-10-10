import { StyleSheet } from "react-native-unistyles";

// Mirrors the collection's four tiles a row (повторяет четыре плитки коллекции в ряд).
const FOUR_IN_ROW_BASIS = "22%";

export const styles = StyleSheet.create((theme) => ({
  skeleton: {
    gap: theme.space[6],
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space[5],
  },
  avatar: {
    width: theme.sizes.avatar.profile,
    height: theme.sizes.avatar.profile,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.bg.sunken,
  },
  lines: {
    flex: 1,
    gap: theme.space[3],
  },
  line: {
    height: theme.sizes.icon.m,
    borderRadius: theme.radius.xs,
    backgroundColor: theme.colors.bg.sunken,
  },
  short: {
    width: "60%",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.space[3],
  },
  tile: {
    flexBasis: FOUR_IN_ROW_BASIS,
    flexGrow: 1,
    aspectRatio: 1,
    borderRadius: theme.radius.m,
    backgroundColor: theme.colors.bg.sunken,
  },
}));
