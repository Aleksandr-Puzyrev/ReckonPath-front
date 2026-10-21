import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme, runtime) => ({
  screen: {
    justifyContent: "center",
    gap: theme.space[5],
    paddingTop: runtime.insets.top,
    paddingBottom: runtime.insets.bottom + theme.space[6],
    paddingHorizontal: theme.space[5],
  },
  head: {
    alignItems: "center",
    gap: theme.space[1],
  },
  secondary: {
    color: theme.colors.text.secondary,
  },
  center: {
    textAlign: "center",
  },
  options: {
    gap: theme.space[3],
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space[4],
    minHeight: theme.sizes.button.l + theme.space[5],
    padding: theme.space[4],
    borderRadius: theme.radius.l,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    backgroundColor: theme.colors.bg.surface,
  },
  selected: {
    borderColor: theme.colors.accent.cyan,
  },
  code: {
    width: theme.sizes.touchTarget,
    textAlign: "center",
    color: theme.colors.accent.cyan,
  },
  texts: {
    flex: 1,
  },
}));
