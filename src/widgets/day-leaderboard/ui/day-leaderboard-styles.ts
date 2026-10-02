import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  card: {
    padding: theme.space[5],
    gap: theme.space[3],
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    backgroundColor: theme.colors.bg.surface,
    boxShadow: theme.elevation[1],
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.space[4],
    padding: theme.space[4],
    borderRadius: theme.radius.m,
    backgroundColor: theme.colors.bg.sunken,
  },
  secondary: {
    flexShrink: 1,
    color: theme.colors.text.secondary,
  },
}));
