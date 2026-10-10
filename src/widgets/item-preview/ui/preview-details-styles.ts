import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  details: {
    gap: theme.space[3],
  },
  tags: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space[3],
  },
  type: {
    color: theme.colors.text.secondary,
  },
  secondary: {
    color: theme.colors.text.secondary,
  },
  timer: {
    color: theme.colors.rarity.legendary,
    fontVariant: ["tabular-nums"],
  },
  visual: {
    alignItems: "center",
    gap: theme.space[3],
  },
  placeholder: {
    width: theme.sizes.shop.previewVisual,
  },
  strike: {
    alignSelf: "flex-end",
    color: theme.colors.text.secondary,
    textDecorationLine: "line-through",
  },
}));
