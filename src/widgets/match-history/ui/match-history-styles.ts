import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  block: {
    gap: theme.space[2],
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space[3],
    minHeight: theme.sizes.touchTarget,
    paddingVertical: theme.space[2],
    paddingHorizontal: theme.space[3],
    borderRadius: theme.radius.l,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    backgroundColor: theme.colors.bg.surface,
  },
  avatar: {
    width: theme.sizes.arena.historyAvatar,
    height: theme.sizes.arena.historyAvatar,
    alignItems: "center",
    justifyContent: "center",
  },
  initial: {
    color: theme.colors.text.onAccent,
  },
  texts: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space[2],
  },
  badge: {
    paddingHorizontal: theme.space[2],
    borderRadius: theme.radius.xs,
    backgroundColor: theme.colors.bg.sunken,
  },
  secondary: {
    color: theme.colors.text.secondary,
  },
  delta: {
    variants: {
      tone: {
        gain: { color: theme.colors.status.success },
        loss: { color: theme.colors.status.danger },
        even: { color: theme.colors.text.secondary },
      },
    },
  },
}));
