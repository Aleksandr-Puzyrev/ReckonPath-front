import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  card: {
    gap: theme.space[3],
    padding: theme.space[5],
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.status.warning,
    backgroundColor: theme.colors.bg.surface,
  },
  note: {
    color: theme.colors.text.secondary,
  },
  actions: {
    flexDirection: "row",
    gap: theme.space[3],
  },
  action: {
    flex: 1,
  },
}));
