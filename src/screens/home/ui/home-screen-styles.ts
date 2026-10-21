import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme, runtime) => ({
  screen: {
    paddingTop: runtime.insets.top,
  },
  top: {
    paddingHorizontal: theme.space[5],
  },
  content: {
    gap: theme.space[4],
    paddingHorizontal: theme.space[5],
    paddingTop: theme.space[2],
    paddingBottom: runtime.insets.bottom + theme.sizes.tabBar.height + theme.space[6],
  },
  offline: {
    padding: theme.space[3],
    borderRadius: theme.radius.m,
    textAlign: "center",
    color: theme.colors.text.secondary,
    backgroundColor: theme.colors.bg.sunken,
  },
  skeleton: {
    gap: theme.space[3],
  },
  skeletonRow: {
    flexDirection: "row",
    gap: theme.space[3],
  },
  skeletonTile: {
    flex: 1,
    height: theme.sizes.home.skeletonTile,
    borderRadius: theme.radius.l,
    backgroundColor: theme.colors.bg.sunken,
  },
}));
