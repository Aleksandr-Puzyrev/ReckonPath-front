import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  card: {
    gap: theme.space[4],
    padding: theme.space[5],
    borderRadius: theme.radius.l,
    backgroundColor: theme.colors.bg.sunken,
  },
  codeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.space[4],
  },
  codeTexts: {
    flexShrink: 1,
    gap: theme.space[1],
  },
  secondary: {
    color: theme.colors.text.secondary,
  },
  form: {
    gap: theme.space[3],
  },
}));
