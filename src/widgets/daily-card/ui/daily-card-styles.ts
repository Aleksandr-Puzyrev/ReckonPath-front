import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space[4],
    padding: theme.space[5],
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    backgroundColor: theme.colors.bg.surface,
    boxShadow: theme.elevation[1],
  },
  pressed: {
    transform: [{ scale: theme.motion.press.scale }],
  },
  text: {
    flex: 1,
    gap: theme.space[1],
  },
  eyebrow: {
    color: theme.colors.accent.cyan,
  },
  secondary: {
    color: theme.colors.text.secondary,
    fontVariant: ["tabular-nums"],
  },
  streak: {
    alignItems: "center",
    minWidth: theme.sizes.touchTarget,
  },
}));
