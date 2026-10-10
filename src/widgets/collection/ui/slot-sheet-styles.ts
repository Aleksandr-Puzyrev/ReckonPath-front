import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  content: {
    gap: theme.space[3],
  },
  visual: {
    alignItems: "center",
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space[4],
    minHeight: theme.sizes.touchTarget,
    paddingVertical: theme.space[3],
    paddingHorizontal: theme.space[4],
    borderRadius: theme.radius.m,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    backgroundColor: theme.colors.bg.surface,
  },
  selected: {
    borderColor: theme.colors.accent.cyan,
  },
  thumb: {
    width: theme.sizes.touchTarget,
  },
  name: {
    flex: 1,
  },
  equipped: {
    textTransform: "uppercase",
    color: theme.colors.accent.cyan,
  },
  have: {
    color: theme.colors.text.secondary,
  },
}));
