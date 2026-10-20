import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme, runtime) => ({
  screen: {
    flex: 1,
    paddingTop: runtime.insets.top,
    paddingBottom: runtime.insets.bottom + theme.space[3],
    paddingHorizontal: theme.space[4],
    gap: theme.space[3],
  },
  flex: {
    flex: 1,
  },
  author: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space[3],
    padding: theme.space[3],
    borderRadius: theme.radius.l,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    backgroundColor: theme.colors.bg.surface,
  },
  avatar: {
    width: theme.sizes.avatar.match - theme.sizes.timerRing.stroke * 2,
    height: theme.sizes.avatar.match - theme.sizes.timerRing.stroke * 2,
    borderRadius: theme.radius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.player.opponent,
  },
  myAvatar: {
    backgroundColor: theme.colors.player.me,
  },
  avatarLetter: {
    color: theme.colors.text.onAccent,
  },
  secondary: {
    color: theme.colors.text.secondary,
  },
  norm: {
    color: theme.colors.accent.cyan,
  },
  banner: {
    alignItems: "center",
    paddingVertical: theme.space[2],
    borderRadius: theme.radius.m,
    backgroundColor: theme.colors.player.me,
  },
  bannerText: {
    color: theme.colors.text.inverse,
  },
  boardArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  turnLine: {
    textAlign: "center",
    color: theme.colors.text.secondary,
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space[3],
  },
  controls: {
    flexDirection: "row",
    gap: theme.space[2],
  },
  menu: {
    gap: theme.space[3],
    padding: theme.space[5],
  },
}));
