import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  sheet: {
    gap: theme.space[4],
  },
  secondary: {
    color: theme.colors.text.secondary,
  },
  error: {
    color: theme.colors.status.danger,
  },
  results: {
    gap: theme.space[2],
  },
  player: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space[3],
    paddingVertical: theme.space[2],
    paddingHorizontal: theme.space[3],
    borderRadius: theme.radius.m,
    backgroundColor: theme.colors.bg.sunken,
  },
  playerName: {
    flex: 1,
  },
}));
