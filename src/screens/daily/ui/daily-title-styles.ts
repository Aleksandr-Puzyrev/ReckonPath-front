import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  eyebrow: {
    color: theme.colors.accent.cyan,
  },
  row: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: theme.space[4],
  },
  countdown: {
    color: theme.colors.text.secondary,
    fontVariant: ["tabular-nums"],
  },
}));
