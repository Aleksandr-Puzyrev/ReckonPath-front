import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  bar: {
    flexDirection: "row",
    gap: theme.space[3],
  },
  cell: {
    flex: 1,
  },
}));
