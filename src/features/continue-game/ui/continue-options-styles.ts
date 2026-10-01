import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  container: {
    gap: theme.space[4],
  },
  title: {
    color: theme.colors.text.secondary,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    gap: theme.space[3],
  },
  option: {
    flex: 1,
  },
  note: {
    color: theme.colors.text.secondary,
    textAlign: "center",
  },
}));
