import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  row: {
    gap: theme.space[3],
  },
  tab: {
    minHeight: theme.sizes.touchTarget,
    paddingHorizontal: theme.space[5],
    justifyContent: "center",
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    backgroundColor: theme.colors.bg.surface,
    overflow: "hidden",
  },
  selected: {
    borderColor: "transparent",
  },
  label: {
    color: theme.colors.text.secondary,
  },
  selectedLabel: {
    color: theme.colors.text.onAccent,
  },
}));
