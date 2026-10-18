import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  block: {
    gap: theme.space[3],
  },
  head: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
  },
  rp: {
    color: theme.colors.accent.cyan,
  },
  list: {
    gap: theme.space[2],
  },
  card: {
    width: theme.sizes.arena.trackStep,
    alignItems: "center",
    gap: theme.space[2],
    padding: theme.space[3],
    borderRadius: theme.radius.l,
    borderWidth: 1,
    backgroundColor: theme.colors.bg.surface,
    variants: {
      state: {
        available: { borderColor: theme.colors.accent.cyan },
        claimed: { borderColor: theme.colors.border.default },
        locked: { borderColor: theme.colors.border.default },
      },
    },
  },
  icon: {
    width: theme.sizes.arena.trackIcon,
    height: theme.sizes.arena.trackIcon,
    borderRadius: theme.radius.m,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.bg.sunken,
  },
  secondary: {
    color: theme.colors.text.secondary,
  },
  claim: {
    alignSelf: "stretch",
    minHeight: theme.sizes.touchTarget,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.s,
    backgroundColor: theme.colors.accent.cyan,
  },
  claimLabel: {
    color: theme.colors.text.onAccent,
  },
  status: {
    minHeight: theme.sizes.touchTarget,
    alignItems: "center",
    justifyContent: "center",
  },
}));
