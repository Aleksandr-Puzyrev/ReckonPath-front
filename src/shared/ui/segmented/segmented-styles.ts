import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  group: {
    flexDirection: "row",
    padding: theme.space[1],
    borderRadius: theme.radius.m,
    backgroundColor: theme.colors.bg.sunken,
  },
  option: {
    flex: 1,
    minHeight: theme.sizes.touchTarget,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.s,
  },
  selected: {
    backgroundColor: theme.colors.bg.surface,
    boxShadow: theme.elevation[1],
  },
  label: {
    color: theme.colors.text.secondary,
  },
  selectedLabel: {
    color: theme.colors.text.primary,
  },
}));
