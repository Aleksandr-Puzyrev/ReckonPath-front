import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: theme.space[4],
  },
  texts: {
    flex: 1,
    gap: theme.space[1],
  },
  eyebrow: {
    color: theme.colors.accent.cyan,
  },
}));
