import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  wrap: {
    gap: theme.space[3],
  },
  hero: {
    gap: theme.space[3],
    padding: theme.space[5],
    borderRadius: theme.radius.xl,
    overflow: "hidden",
  },
  lock: {
    width: theme.sizes.arena.emblem,
    height: theme.sizes.arena.emblem,
    borderRadius: theme.radius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.bg.overlay,
  },
  eyebrow: {
    color: theme.colors.accent.cyan,
  },
  light: {
    color: theme.colors.text.onAccent,
  },
  progressTexts: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  track: {
    height: theme.sizes.arena.progress,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.bg.overlay,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.accent.cyan,
  },
  card: {
    gap: theme.space[1],
    padding: theme.space[4],
    borderRadius: theme.radius.l,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    backgroundColor: theme.colors.bg.surface,
  },
  secondary: {
    color: theme.colors.text.secondary,
  },
}));
