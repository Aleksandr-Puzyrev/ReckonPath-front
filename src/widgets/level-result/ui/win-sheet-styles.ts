import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  eyebrow: {
    color: theme.colors.status.success,
    textAlign: "center",
  },
  center: {
    textAlign: "center",
  },
  stars: {
    flexDirection: "row",
    justifyContent: "center",
    gap: theme.space[3],
  },
  record: {
    color: theme.colors.currency.coin,
    textAlign: "center",
  },
  moves: {
    color: theme.colors.text.secondary,
    textAlign: "center",
  },
  actions: {
    flexDirection: "row",
    gap: theme.space[3],
  },
  again: {
    flex: 1,
  },
  next: {
    flex: 2,
  },
}));
