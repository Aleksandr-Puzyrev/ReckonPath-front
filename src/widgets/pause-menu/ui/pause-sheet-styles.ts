import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: "row",
    gap: theme.space[3],
  },
  cell: {
    flex: 1,
  },
  switches: {
    borderRadius: theme.radius.l,
    backgroundColor: theme.colors.bg.sunken,
  },
}));
