import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  form: {
    gap: theme.space[4],
  },
  hint: {
    color: theme.colors.text.secondary,
  },
  ok: {
    color: theme.colors.status.success,
  },
  note: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space[2],
    padding: theme.space[3],
    borderRadius: theme.radius.m,
    backgroundColor: theme.colors.bg.sunken,
  },
  noteText: {
    flex: 1,
    color: theme.colors.text.secondary,
  },
}));
