import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  error: {
    gap: theme.space[4],
  },
  message: {
    textAlign: "center",
    color: theme.colors.text.secondary,
  },
}));
