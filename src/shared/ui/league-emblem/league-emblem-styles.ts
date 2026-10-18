import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  emblem: {
    width: theme.sizes.arena.emblem,
    height: theme.sizes.arena.emblem,
    borderRadius: theme.radius.full,
    alignItems: "center",
    justifyContent: "center",
    variants: {
      league: {
        bronze: { backgroundColor: theme.colors.league.bronze },
        silver: { backgroundColor: theme.colors.league.silver },
        gold: { backgroundColor: theme.colors.league.gold },
        platinum: { backgroundColor: theme.colors.league.platinum },
        diamond: { backgroundColor: theme.colors.league.diamond },
        master: { backgroundColor: theme.colors.league.master },
      },
    },
  },
  numeral: {
    color: theme.colors.text.onAccent,
  },
}));
