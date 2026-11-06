import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme, runtime) => ({
  content: {
    flexGrow: 1,
    justifyContent: "space-between",
    gap: theme.space[7],
    paddingTop: runtime.insets.top + theme.space[7],
    paddingHorizontal: theme.space[6],
    paddingBottom: runtime.insets.bottom + theme.space[7],
  },
  texts: {
    gap: theme.space[4],
  },
  body: {
    color: theme.colors.text.secondary,
  },
  link: {
    alignSelf: "flex-start",
    minHeight: theme.sizes.touchTarget,
    color: theme.colors.accent.cyan,
  },
  actions: {
    gap: theme.space[3],
  },
}));
