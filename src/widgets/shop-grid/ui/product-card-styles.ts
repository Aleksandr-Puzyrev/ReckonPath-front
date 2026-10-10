import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  card: {
    flex: 1,
    gap: theme.space[3],
    padding: theme.space[4],
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    backgroundColor: theme.colors.bg.surface,
    variants: {
      rarity: {
        common: { borderColor: theme.colors.border.default },
        rare: { borderColor: theme.colors.rarity.rare },
        epic: { borderColor: theme.colors.rarity.epic },
        legendary: { borderColor: theme.colors.rarity.legendary },
      },
    },
  },
  pressed: {
    transform: [{ scale: theme.motion.press.scale }],
  },
  timer: {
    position: "absolute",
    top: theme.space[3],
    left: theme.space[3],
    paddingHorizontal: theme.space[3],
    paddingVertical: theme.space[1],
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.bg.overlay,
  },
  timerText: {
    color: theme.colors.text.onAccent,
    fontVariant: ["tabular-nums"],
  },
  type: {
    color: theme.colors.text.secondary,
    textTransform: "uppercase",
  },
}));
