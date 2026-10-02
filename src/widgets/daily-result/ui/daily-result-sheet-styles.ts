import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.space[4],
  },
  eyebrow: {
    color: theme.colors.status.success,
  },
  stats: {
    flexDirection: "row",
    paddingVertical: theme.space[4],
    borderRadius: theme.radius.l,
    backgroundColor: theme.colors.bg.sunken,
  },
  stat: {
    flex: 1,
    paddingHorizontal: theme.space[4],
    gap: theme.space[2],
  },
  statDivider: {
    borderLeftWidth: 1,
    borderLeftColor: theme.colors.border.default,
  },
  label: {
    color: theme.colors.text.secondary,
  },
  place: {
    color: theme.colors.accent.cyan,
  },
  muted: {
    color: theme.colors.text.secondary,
  },
  streak: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space[4],
    paddingVertical: theme.space[3],
    paddingHorizontal: theme.space[5],
    borderRadius: theme.radius.l,
    backgroundColor: theme.colors.bg.sunken,
  },
  actions: {
    flexDirection: "row",
    gap: theme.space[3],
  },
  action: {
    flex: 1,
  },
}));
