import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space[3],
    minHeight: theme.sizes.topBar.height,
  },
  titles: {
    flex: 1,
    alignItems: "center",
  },
  eyebrow: {
    color: theme.colors.accent.cyan,
  },
  title: {
    textAlign: "center",
  },
}));
