import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme, runtime) => ({
  screen: {
    flex: 1,
  },
  top: {
    paddingTop: runtime.insets.top,
    paddingHorizontal: theme.space[5],
  },
  content: {
    gap: theme.space[3],
    paddingHorizontal: theme.space[5],
    paddingBottom: theme.space[7] + runtime.insets.bottom,
  },
  secondary: {
    color: theme.colors.text.secondary,
  },
  score: {
    textAlign: "center",
  },
  maps: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: theme.space[4],
  },
  map: {
    alignItems: "center",
    gap: theme.space[2],
  },
  message: {
    textAlign: "center",
    color: theme.colors.text.secondary,
  },
  error: {
    gap: theme.space[3],
    alignItems: "center",
  },
  skeleton: {
    height: theme.sizes.arena.detailsMap,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.bg.sunken,
  },
}));
