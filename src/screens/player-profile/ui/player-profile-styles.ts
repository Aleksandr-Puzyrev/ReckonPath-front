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
    flexGrow: 1,
    gap: theme.space[4],
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
  hero: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space[4],
    padding: theme.space[5],
    borderRadius: theme.radius.xl,
    overflow: "hidden",
  },
  avatar: {
    width: theme.sizes.avatar.profile,
    height: theme.sizes.avatar.profile,
    alignItems: "center",
    justifyContent: "center",
  },
  onHero: {
    color: theme.colors.text.onAccent,
  },
  heroTexts: {
    flex: 1,
    gap: theme.space[1],
  },
  card: {
    alignItems: "center",
    gap: theme.space[2],
    padding: theme.space[4],
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    backgroundColor: theme.colors.bg.surface,
  },
  score: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space[4],
  },
  mine: {
    color: theme.colors.player.me,
  },
  theirs: {
    color: theme.colors.player.opponent,
  },
  secondary: {
    color: theme.colors.text.secondary,
  },
  stats: {
    flexDirection: "row",
    gap: theme.space[2],
  },
  stat: {
    flex: 1,
    gap: theme.space[1],
    paddingVertical: theme.space[3],
    paddingHorizontal: theme.space[3],
    borderRadius: theme.radius.l,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    backgroundColor: theme.colors.bg.surface,
  },
  action: {
    marginTop: "auto",
    gap: theme.space[2],
  },
  sheet: {
    gap: theme.space[4],
  },
  skeletonHero: {
    height: theme.sizes.avatar.profile + theme.space[5] * 2,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.bg.sunken,
  },
  skeletonCard: {
    height: theme.sizes.avatar.profile + theme.space[4] * 2,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.bg.sunken,
  },
}));
