import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme, runtime) => ({
  sheet: {
    gap: theme.space[5],
  },
  head: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space[4],
  },
  texts: {
    flex: 1,
    gap: theme.space[1],
  },
  secondary: {
    color: theme.colors.text.secondary,
  },
  centered: {
    textAlign: "center",
  },
  layer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.space[4],
    paddingTop: runtime.insets.top,
    paddingBottom: runtime.insets.bottom,
    paddingHorizontal: theme.space[5],
    backgroundColor: theme.colors.bg.overlay,
  },
  card: {
    width: "100%",
    maxWidth: theme.sizes.contentMaxWidth,
    alignItems: "center",
    gap: theme.space[4],
    padding: theme.space[6],
    borderRadius: theme.radius.xxl,
    backgroundColor: theme.colors.bg.surface,
    boxShadow: theme.elevation[2],
  },
}));
