import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  hero: {
    padding: theme.space[5],
    borderRadius: theme.radius.xl,
    overflow: "hidden",
    gap: theme.space[4],
  },
  head: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.space[4],
  },
  texts: {
    flex: 1,
    gap: theme.space[2],
  },
  eyebrow: {
    color: theme.colors.accent.cyan,
  },
  title: {
    color: theme.colors.text.onAccent,
  },
  stats: {
    flexDirection: "row",
    gap: theme.space[2],
  },
  stat: {
    flex: 1,
    minWidth: 0,
    gap: theme.space[1],
  },
  dim: {
    color: theme.colors.text.onAccent,
  },
}));
