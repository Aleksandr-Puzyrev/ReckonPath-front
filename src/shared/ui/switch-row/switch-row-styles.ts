import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  row: {
    minHeight: theme.sizes.button.m,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.space[4],
  },
  label: {
    flex: 1,
  },
}));
