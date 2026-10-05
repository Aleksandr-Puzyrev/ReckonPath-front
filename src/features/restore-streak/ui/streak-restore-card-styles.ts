import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  card: {
    padding: theme.space[5],
    gap: theme.space[3],
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.feedback.warm,
    backgroundColor: theme.colors.bg.surface,
  },
  secondary: {
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
