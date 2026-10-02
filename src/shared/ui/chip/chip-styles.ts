import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  chip: {
    minHeight: theme.space[7],
    paddingHorizontal: theme.space[4],
    borderRadius: theme.radius.s,
    backgroundColor: theme.colors.bg.sunken,
    justifyContent: "center",
  },
  text: {
    color: theme.colors.text.primary,
  },
}));
