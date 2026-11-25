import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  block: {
    gap: theme.space[2],
  },
  head: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.space[4],
  },
  segment: {
    flex: 1,
  },
  card: {
    gap: theme.space[1],
    padding: theme.space[2],
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    backgroundColor: theme.colors.bg.surface,
  },
  hint: {
    padding: theme.space[3],
    textAlign: "center",
    color: theme.colors.text.secondary,
  },
  status: {
    alignItems: "center",
    gap: theme.space[3],
    padding: theme.space[3],
  },
  skeletonRow: {
    height: theme.sizes.touchTarget,
    borderRadius: theme.radius.m,
    backgroundColor: theme.colors.bg.sunken,
  },
}));
