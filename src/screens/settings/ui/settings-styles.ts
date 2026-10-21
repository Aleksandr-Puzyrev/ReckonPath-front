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
  side: {
    width: theme.sizes.touchTarget,
  },
  content: {
    gap: theme.space[4],
    paddingHorizontal: theme.space[4],
    paddingBottom: runtime.insets.bottom + theme.space[6],
  },
  group: {
    gap: theme.space[2],
  },
  groupTitle: {
    marginHorizontal: theme.space[1],
    color: theme.colors.text.secondary,
  },
  card: {
    overflow: "hidden",
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    backgroundColor: theme.colors.bg.surface,
  },
  value: {
    color: theme.colors.text.secondary,
  },
  success: {
    color: theme.colors.status.success,
  },
  valueRow: {
    flexShrink: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space[1],
  },
  idText: {
    flexShrink: 1,
    color: theme.colors.accent.cyan,
  },
  footer: {
    alignItems: "center",
    gap: theme.space[1],
    paddingTop: theme.space[2],
  },
  summary: {
    gap: theme.space[2],
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: theme.space[3],
  },
  scheduled: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.space[4],
    paddingHorizontal: theme.space[7],
  },
  center: {
    textAlign: "center",
  },
}));
