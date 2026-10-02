import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  card: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: theme.space[3],
    paddingHorizontal: theme.space[5],
    paddingVertical: theme.space[4],
    borderRadius: theme.radius.xl,
    overflow: "hidden",
    variants: {
      isUnlocked: {
        true: { minHeight: theme.sizes.worldHeader.height },
        false: {
          minHeight: theme.sizes.worldHeader.lockedHeight,
          backgroundColor: theme.colors.bg.sunken,
        },
      },
      isPerfect: {
        true: { borderWidth: 2, borderColor: theme.colors.currency.coin },
        false: {},
      },
    },
  },
  texts: {
    flex: 1,
    gap: theme.space[1],
  },
  eyebrow: {
    variants: {
      isUnlocked: {
        true: { color: theme.colors.text.onAccent },
        false: { color: theme.colors.text.secondary },
      },
    },
  },
  title: {
    variants: {
      isUnlocked: {
        true: { color: theme.colors.text.onAccent },
        false: { color: theme.colors.text.secondary },
      },
    },
  },
  subtitle: {
    variants: {
      isUnlocked: {
        true: { color: theme.colors.text.onAccent },
        false: { color: theme.colors.text.secondary },
      },
    },
  },
  side: {
    alignItems: "flex-end",
    gap: theme.space[2],
  },
  badge: {
    paddingHorizontal: theme.space[3],
    paddingVertical: theme.space[1],
    borderRadius: theme.radius.m,
    overflow: "hidden",
  },
  badgeText: {
    color: theme.colors.text.onGold,
  },
  stars: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space[2],
  },
  starsText: {
    variants: {
      isUnlocked: {
        true: { color: theme.colors.text.onAccent },
        false: { color: theme.colors.text.secondary },
      },
    },
  },
  range: {
    variants: {
      isUnlocked: {
        true: { color: theme.colors.text.onAccent },
        false: { color: theme.colors.text.secondary },
      },
    },
  },
}));
