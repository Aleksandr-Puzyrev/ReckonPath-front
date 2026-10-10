import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  actions: {
    flexDirection: "row",
    gap: theme.space[3],
  },
  close: {
    flex: 2,
  },
  main: {
    flex: 3,
  },
}));
