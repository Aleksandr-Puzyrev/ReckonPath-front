import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  hero: {
    overflow: "hidden",
    gap: theme.space[4],
    padding: theme.space[5],
    borderRadius: theme.radius.xl,
  },
  head: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: theme.space[3],
  },
  texts: {
    flex: 1,
    gap: theme.space[1],
  },
  eyebrow: {
    color: theme.colors.accent.cyan,
  },
  title: {
    color: theme.colors.text.onAccent,
  },
  subtitle: {
    color: theme.colors.text.onAccent,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.space[2],
  },
  preview: {
    alignSelf: "center",
  },
  found: {
    color: theme.colors.text.onAccent,
  },
  actions: {
    gap: theme.space[2],
  },
}));
