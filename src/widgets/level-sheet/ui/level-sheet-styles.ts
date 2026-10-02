import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.space[4],
  },
  titles: {
    flex: 1,
    gap: theme.space[1],
  },
  eyebrow: {
    color: theme.colors.accent.cyan,
  },
  secondary: {
    color: theme.colors.text.secondary,
  },
  body: {
    flexDirection: "row",
    gap: theme.space[4],
    alignItems: "center",
  },
  facts: {
    flex: 1,
    gap: theme.space[3],
  },
  fact: {
    paddingHorizontal: theme.space[4],
    paddingVertical: theme.space[3],
    borderRadius: theme.radius.s,
    backgroundColor: theme.colors.bg.sunken,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.space[3],
  },
}));
