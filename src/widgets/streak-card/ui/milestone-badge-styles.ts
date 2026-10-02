import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  milestone: {
    alignItems: "center",
    gap: theme.space[2],
  },
  badge: {
    width: theme.sizes.daily.milestone,
    height: theme.sizes.daily.milestone,
    borderRadius: theme.radius.full,
    alignItems: "center",
    justifyContent: "center",
    variants: {
      state: {
        reached: { backgroundColor: theme.colors.feedback.warm },
        next: {
          backgroundColor: theme.colors.bg.surface,
          borderWidth: 2,
          borderColor: theme.colors.feedback.warm,
        },
        ahead: { backgroundColor: theme.colors.bg.sunken },
      },
    },
  },
  badgeText: {
    variants: {
      state: {
        reached: { color: theme.colors.text.onAccent },
        next: { color: theme.colors.feedback.warm },
        ahead: { color: theme.colors.text.secondary },
      },
    },
  },
  reward: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space[1],
  },
  secondary: {
    color: theme.colors.text.secondary,
  },
}));
