import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  chip: {
    minHeight: theme.space[8],
    paddingHorizontal: theme.space[4],
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    backgroundColor: theme.colors.bg.surface,
    justifyContent: "center",
  },
  text: {
    color: theme.colors.text.primary,
  },
}));
