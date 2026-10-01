import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme, runtime) => ({
  screen: {
    paddingTop: runtime.insets.top + theme.space[6],
    paddingHorizontal: theme.space[5],
    gap: theme.space[4],
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space[4],
  },
  title: {
    flex: 1,
  },
}));
