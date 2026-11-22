import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme, runtime) => ({
  banner: {
    position: "absolute",
    top: runtime.insets.top + theme.space[2],
    left: theme.space[4],
    right: theme.space[4],
    alignSelf: "center",
    maxWidth: theme.sizes.contentMaxWidth,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    backgroundColor: theme.colors.bg.surface,
    boxShadow: theme.elevation[2],
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space[3],
    padding: theme.space[3],
  },
  texts: {
    flex: 1,
    gap: theme.space[1],
  },
  secondary: {
    color: theme.colors.text.secondary,
  },
  track: {
    height: theme.sizes.progressBar.height,
    backgroundColor: theme.colors.bg.sunken,
  },
  bar: {
    height: "100%",
    backgroundColor: theme.colors.player.opponent,
  },
}));
