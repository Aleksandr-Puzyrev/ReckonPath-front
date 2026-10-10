import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  price: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space[2],
  },
  amount: {
    fontVariant: ["tabular-nums"],
  },
  mark: {
    textTransform: "uppercase",
    color: theme.colors.text.secondary,
    variants: {
      isEquipped: {
        true: { color: theme.colors.accent.cyan },
        false: {},
      },
    },
  },
}));
