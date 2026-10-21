import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  sheet: {
    gap: theme.space[4],
    padding: theme.space[5],
  },
  secondary: {
    color: theme.colors.text.secondary,
  },
  eyebrow: {
    color: theme.colors.text.secondary,
  },
}));
