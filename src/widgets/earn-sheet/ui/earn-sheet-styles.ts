import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  title: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space[3],
  },
  balances: {
    flexDirection: "row",
    gap: theme.space[3],
  },
  balance: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space[3],
    padding: theme.space[4],
    borderRadius: theme.radius.l,
    backgroundColor: theme.colors.bg.sunken,
  },
  secondary: {
    color: theme.colors.text.secondary,
  },
}));
