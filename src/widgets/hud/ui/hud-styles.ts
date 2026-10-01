import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  hud: {
    gap: theme.space[4],
  },
  counters: {
    flexDirection: "row",
    gap: theme.space[3],
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space[4],
  },
  spacer: {
    flex: 1,
  },
}));
