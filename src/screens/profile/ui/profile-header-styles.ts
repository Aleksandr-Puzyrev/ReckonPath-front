import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space[5],
  },
  texts: {
    flex: 1,
    gap: theme.space[2],
  },
  secondary: {
    color: theme.colors.text.secondary,
  },
  track: {
    height: theme.sizes.progressBar.height,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.bg.sunken,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    backgroundColor: theme.colors.accent.cyan,
  },
}));
