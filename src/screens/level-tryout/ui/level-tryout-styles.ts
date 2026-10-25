import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme, runtime) => ({
  screen: {
    gap: theme.space[3],
    paddingTop: runtime.insets.top,
    paddingBottom: runtime.insets.bottom + theme.space[4],
    paddingHorizontal: theme.space[4],
  },
  top: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space[3],
    minHeight: theme.sizes.topBar.height,
  },
  title: {
    flex: 1,
  },
  counters: {
    flexDirection: "row",
    gap: theme.space[2],
  },
  counter: {
    flex: 1,
  },
  boardArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  result: {
    gap: theme.space[3],
    padding: theme.space[5],
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.bg.surface,
    boxShadow: theme.elevation[2],
  },
  compare: {
    gap: theme.space[1],
  },
  beaten: {
    color: theme.colors.status.success,
  },
  missed: {
    color: theme.colors.text.secondary,
  },
}));
