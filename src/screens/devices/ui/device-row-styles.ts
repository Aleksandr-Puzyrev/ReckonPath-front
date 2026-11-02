import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space[4],
    padding: theme.space[5],
  },
  divided: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.default,
  },
  texts: {
    flex: 1,
    gap: theme.space[1],
  },
  secondary: {
    color: theme.colors.text.secondary,
  },
  current: {
    color: theme.colors.status.success,
  },
}));
