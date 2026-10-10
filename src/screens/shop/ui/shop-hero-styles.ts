import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  hero: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space[4],
    padding: theme.space[5],
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.bg.surface,
  },
  texts: {
    flex: 1,
    gap: theme.space[2],
  },
  eyebrow: {
    color: theme.colors.accent.cyan,
  },
  subtitle: {
    color: theme.colors.text.secondary,
  },
}));
