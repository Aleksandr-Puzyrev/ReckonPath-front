import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme, runtime) => ({
  screen: {
    paddingTop: runtime.insets.top,
  },
  top: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space[3],
    minHeight: theme.sizes.topBar.height,
    paddingHorizontal: theme.space[4],
  },
  title: {
    flex: 1,
    textAlign: "center",
  },
  topSpacer: {
    width: theme.sizes.touchTarget,
  },
  head: {
    gap: theme.space[3],
    paddingHorizontal: theme.space[4],
    paddingBottom: theme.space[3],
  },
  scopeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space[3],
  },
  scope: {
    flex: 1,
  },
  secondary: {
    color: theme.colors.text.secondary,
  },
  message: {
    textAlign: "center",
    color: theme.colors.text.secondary,
  },
  content: {
    paddingHorizontal: theme.space[4],
    paddingBottom: runtime.insets.bottom + theme.space[6],
  },
  item: {
    paddingBottom: theme.space[2],
  },
  pinned: {
    paddingHorizontal: theme.space[4],
    paddingTop: theme.space[2],
    paddingBottom: runtime.insets.bottom + theme.space[4],
  },
  status: {
    gap: theme.space[4],
    padding: theme.space[4],
  },
  empty: {
    alignItems: "center",
    gap: theme.space[4],
    paddingTop: theme.space[9],
    paddingHorizontal: theme.space[5],
  },
  emptyTitle: {
    textAlign: "center",
  },
  skeletonRow: {
    height: theme.sizes.touchTarget + theme.space[2] * 2,
    marginBottom: theme.space[2],
    borderRadius: theme.radius.l,
    backgroundColor: theme.colors.bg.sunken,
  },
}));
