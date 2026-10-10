import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  banner: {
    gap: theme.space[3],
    padding: theme.space[5],
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.rarity.legendary,
    backgroundColor: theme.colors.bg.surface,
  },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    color: theme.colors.rarity.legendary,
  },
  timer: {
    paddingHorizontal: theme.space[3],
    paddingVertical: theme.space[1],
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.bg.sunken,
  },
  timerText: {
    fontVariant: ["tabular-nums"],
  },
  subtitle: {
    color: theme.colors.text.secondary,
  },
}));
