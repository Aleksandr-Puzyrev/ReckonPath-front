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
  content: {
    gap: theme.space[3],
    paddingHorizontal: theme.space[4],
    paddingBottom: runtime.insets.bottom + theme.space[6],
  },
  message: {
    textAlign: "center",
    color: theme.colors.text.secondary,
  },
  status: {
    gap: theme.space[4],
    padding: theme.space[4],
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space[4],
    paddingVertical: theme.space[3],
    paddingHorizontal: theme.space[4],
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    backgroundColor: theme.colors.bg.surface,
  },
  name: {
    flex: 1,
  },
  skeletonRow: {
    height: theme.sizes.avatar.match + theme.space[3] * 2,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.bg.sunken,
  },
}));
