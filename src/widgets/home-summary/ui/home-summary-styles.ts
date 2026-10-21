import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  links: {
    flexDirection: "row",
    gap: theme.space[3],
  },
  link: {
    flex: 1,
    minHeight: theme.sizes.button.l,
    gap: theme.space[2],
    padding: theme.space[4],
    borderRadius: theme.radius.l,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    backgroundColor: theme.colors.bg.surface,
  },
  pressed: {
    backgroundColor: theme.colors.bg.sunken,
  },
  linkHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.space[2],
  },
  secondary: {
    color: theme.colors.text.secondary,
  },
  timer: {
    paddingHorizontal: theme.space[2],
    paddingVertical: theme.space[1],
    borderRadius: theme.radius.s,
    backgroundColor: theme.colors.bg.sunken,
  },
  lockRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space[1],
  },
  today: {
    gap: theme.space[2],
  },
  todayHead: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
  },
  stats: {
    flexDirection: "row",
    gap: theme.space[2],
  },
  stat: {
    flex: 1,
    gap: theme.space[1],
    padding: theme.space[4],
    borderRadius: theme.radius.l,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    backgroundColor: theme.colors.bg.surface,
  },
}));
