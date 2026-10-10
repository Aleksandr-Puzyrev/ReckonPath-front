import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  parts: {
    gap: theme.space[2],
  },
  part: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.space[3],
    paddingVertical: theme.space[3],
    paddingHorizontal: theme.space[4],
    borderRadius: theme.radius.s,
    backgroundColor: theme.colors.bg.sunken,
  },
  name: {
    flex: 1,
  },
  have: {
    textTransform: "uppercase",
    color: theme.colors.status.success,
  },
}));
