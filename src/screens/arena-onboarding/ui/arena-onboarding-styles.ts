import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme, rt) => ({
  screen: {
    justifyContent: "center",
    paddingTop: rt.insets.top,
    paddingBottom: rt.insets.bottom,
    paddingHorizontal: theme.space[5],
  },
  card: {
    alignSelf: "center",
    width: "100%",
    maxWidth: theme.sizes.contentMaxWidth,
    gap: theme.space[4],
    padding: theme.space[6],
    borderRadius: theme.radius.xxl,
    backgroundColor: theme.colors.bg.surface,
    boxShadow: theme.elevation[2],
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  eyebrow: {
    color: theme.colors.accent.cyan,
  },
  secondary: {
    color: theme.colors.text.secondary,
  },
  demo: {
    minHeight: theme.sizes.ruleCard.demoMinHeight,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.bg.sunken,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: theme.space[2],
  },
  dot: {
    width: theme.space[3],
    height: theme.space[3],
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.border.strong,
  },
  dotActive: {
    width: theme.space[6],
    backgroundColor: theme.colors.accent.cyan,
  },
  skip: {
    alignSelf: "center",
    minHeight: theme.sizes.touchTarget,
    justifyContent: "center",
    paddingHorizontal: theme.space[4],
  },
  players: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space[6],
  },
  avatar: {
    width: theme.sizes.avatar.match - theme.sizes.timerRing.stroke * 2,
    height: theme.sizes.avatar.match - theme.sizes.timerRing.stroke * 2,
    borderRadius: theme.radius.full,
  },
  avatarMe: {
    backgroundColor: theme.colors.player.me,
  },
  avatarOpponent: {
    backgroundColor: theme.colors.player.opponent,
  },
}));
