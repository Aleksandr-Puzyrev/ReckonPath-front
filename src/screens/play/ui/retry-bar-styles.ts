import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space[3],
  },
  text: {
    flex: 1,
    color: theme.colors.text.secondary,
  },
}));
