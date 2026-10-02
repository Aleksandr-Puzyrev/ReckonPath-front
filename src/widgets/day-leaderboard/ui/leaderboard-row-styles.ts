import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space[4],
    minHeight: theme.sizes.touchTarget,
    paddingHorizontal: theme.space[3],
    borderRadius: theme.radius.m,
    variants: {
      isMine: {
        true: { backgroundColor: theme.colors.bg.sunken },
      },
    },
  },
  rank: {
    minWidth: theme.sizes.daily.rankBadge,
    height: theme.sizes.daily.rankBadge,
    paddingHorizontal: theme.space[2],
    borderRadius: theme.radius.full,
    alignItems: "center",
    justifyContent: "center",
    variants: {
      medal: {
        gold: { backgroundColor: theme.colors.league.gold },
        silver: { backgroundColor: theme.colors.league.silver },
        bronze: { backgroundColor: theme.colors.league.bronze },
        none: { backgroundColor: theme.colors.bg.sunken },
      },
    },
  },
  rankText: {
    variants: {
      medal: {
        gold: { color: theme.colors.text.onGold },
        silver: { color: theme.colors.text.onGold },
        bronze: { color: theme.colors.text.onGold },
        none: { color: theme.colors.text.secondary },
      },
    },
  },
  name: {
    flex: 1,
    variants: {
      isMine: {
        true: { color: theme.colors.accent.cyan },
      },
    },
  },
}));
