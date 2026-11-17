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
  head: {
    gap: theme.space[3],
    paddingHorizontal: theme.space[4],
    paddingBottom: theme.space[3],
  },
  offline: {
    textAlign: "center",
    color: theme.colors.text.secondary,
  },
  content: {
    paddingHorizontal: theme.space[4],
    paddingBottom: runtime.insets.bottom + theme.space[6],
  },
  item: {
    paddingBottom: theme.space[3],
  },
  sectionTitle: {
    paddingTop: theme.space[4],
    paddingBottom: theme.space[3],
    color: theme.colors.text.secondary,
  },
  message: {
    textAlign: "center",
    color: theme.colors.text.secondary,
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
    height: theme.sizes.avatar.match + theme.space[3] * 2,
    marginBottom: theme.space[3],
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.bg.sunken,
  },
}));
