import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme, runtime) => ({
  background: {
    backgroundColor: theme.colors.bg.surface,
    borderRadius: theme.radius.xxl,
  },
  handle: {
    backgroundColor: theme.colors.border.strong,
  },
  content: {
    paddingHorizontal: theme.space[6],
    paddingTop: theme.space[3],
    paddingBottom: theme.space[6] + runtime.insets.bottom,
    gap: theme.space[4],
  },
}));
