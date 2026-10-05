import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space[3],
    minHeight: theme.sizes.topBar.height,
  },
  emblem: {
    width: theme.sizes.topBar.emblem,
    height: theme.sizes.topBar.emblem,
    borderRadius: theme.radius.s,
  },
  brand: {
    flex: 1,
  },
  accent: {
    color: theme.colors.accent.cyan,
  },
  tagline: {
    color: theme.colors.text.secondary,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space[2],
    height: theme.sizes.chip.height,
    minWidth: theme.sizes.touchTarget,
    paddingHorizontal: theme.space[3],
    borderRadius: theme.radius.m,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    backgroundColor: theme.colors.bg.surface,
  },
  pressed: {
    transform: [{ scale: theme.motion.press.scale }],
  },
}));
