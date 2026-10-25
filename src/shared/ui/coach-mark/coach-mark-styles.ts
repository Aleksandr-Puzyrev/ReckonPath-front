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
  body: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.space[4],
  },
  texts: {
    flex: 1,
    gap: theme.space[1],
  },
  text: {
    color: theme.colors.text.primary,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: theme.space[3],
  },
  caption: {
    marginRight: "auto",
    color: theme.colors.text.secondary,
  },
}));
