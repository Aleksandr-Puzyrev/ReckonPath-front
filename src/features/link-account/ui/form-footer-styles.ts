import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  footer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: theme.space[2],
  },
  question: {
    color: theme.colors.text.secondary,
  },
  action: {
    minHeight: theme.sizes.touchTarget,
    justifyContent: "center",
  },
  actionText: {
    color: theme.colors.accent.cyan,
  },
}));
