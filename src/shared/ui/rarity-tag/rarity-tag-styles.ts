import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  tag: {
    alignSelf: "flex-start",
    paddingHorizontal: theme.space[3],
    paddingVertical: theme.space[1],
    borderRadius: theme.radius.xs,
    borderWidth: 1,
    variants: {
      rarity: {
        common: { borderColor: theme.colors.rarity.common },
        rare: { borderColor: theme.colors.rarity.rare },
        epic: { borderColor: theme.colors.rarity.epic },
        legendary: { borderColor: theme.colors.rarity.legendary },
      },
    },
  },
  label: {
    textTransform: "uppercase",
    variants: {
      rarity: {
        common: { color: theme.colors.rarity.common },
        rare: { color: theme.colors.rarity.rare },
        epic: { color: theme.colors.rarity.epic },
        legendary: { color: theme.colors.rarity.legendary },
      },
    },
  },
}));
