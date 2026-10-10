import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space[4],
    minHeight: theme.sizes.touchTarget,
    padding: theme.space[4],
    borderRadius: theme.radius.m,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    backgroundColor: theme.colors.bg.surface,
    variants: {
      isDisabled: {
        true: { backgroundColor: theme.colors.bg.sunken },
        false: {},
      },
    },
  },
  texts: {
    flex: 1,
    gap: theme.space[1],
  },
  title: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space[2],
  },
  reward: {
    color: theme.colors.currency.emerald,
  },
  caption: {
    color: theme.colors.text.secondary,
  },
}));
