import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  card: {
    gap: theme.space[4],
    padding: theme.space[5],
    borderRadius: theme.radius.xl,
    borderWidth: 1.5,
    borderColor: theme.colors.accent.cyan,
    backgroundColor: theme.colors.bg.surface,
    boxShadow: theme.elevation[2],
  },
  text: {
    color: theme.colors.text.primary,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: theme.space[3],
  },
}));
