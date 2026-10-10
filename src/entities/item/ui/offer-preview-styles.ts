import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  preview: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: theme.radius.m,
    backgroundColor: theme.colors.bg.sunken,
  },
  placeholder: {
    alignItems: "center",
    justifyContent: "center",
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
}));
