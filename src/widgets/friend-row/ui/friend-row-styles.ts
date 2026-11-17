import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space[4],
    paddingVertical: theme.space[3],
    paddingHorizontal: theme.space[4],
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    backgroundColor: theme.colors.bg.surface,
  },
  texts: {
    flex: 1,
    gap: theme.space[1],
  },
  meta: {
    color: theme.colors.text.secondary,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space[2],
  },
}));
