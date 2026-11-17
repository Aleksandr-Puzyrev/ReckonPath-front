import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space[4],
    minHeight: theme.sizes.touchTarget,
    paddingVertical: theme.space[4],
    paddingHorizontal: theme.space[5],
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    backgroundColor: theme.colors.bg.surface,
  },
  pressed: {
    transform: [{ scale: theme.motion.press.scale }],
  },
  label: {
    flex: 1,
  },
  badge: {
    minWidth: theme.sizes.friends.badge,
    height: theme.sizes.friends.badge,
    paddingHorizontal: theme.space[2],
    borderRadius: theme.radius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.accent.pink,
  },
  badgeText: {
    color: theme.colors.text.onAccent,
  },
}));
