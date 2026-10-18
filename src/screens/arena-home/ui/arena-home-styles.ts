import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme, runtime) => ({
  screen: {
    flex: 1,
  },
  top: {
    paddingTop: runtime.insets.top,
    paddingHorizontal: theme.space[5],
  },
  content: {
    gap: theme.space[5],
    paddingHorizontal: theme.space[5],
    paddingTop: theme.space[4],
    paddingBottom: theme.sizes.tabBar.height + theme.sizes.tabBar.inset + runtime.insets.bottom,
  },
  offline: {
    textAlign: "center",
    color: theme.colors.text.secondary,
  },
  fight: {
    gap: theme.space[2],
  },
  fightButtons: {
    flexDirection: "row",
    gap: theme.space[2],
  },
  fightMain: {
    flex: 1,
  },
  secondary: {
    textAlign: "center",
    color: theme.colors.text.secondary,
  },
  message: {
    textAlign: "center",
    color: theme.colors.text.secondary,
  },
  error: {
    gap: theme.space[3],
    alignItems: "center",
  },
  skeleton: {
    gap: theme.space[5],
  },
  skeletonHero: {
    height: theme.sizes.worldHeader.height * 2,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.bg.sunken,
  },
  skeletonButton: {
    height: theme.sizes.button.l,
    borderRadius: theme.radius.l,
    backgroundColor: theme.colors.bg.sunken,
  },
  skeletonCard: {
    height: theme.sizes.arena.myMap + theme.space[4] * 2,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.bg.sunken,
  },
}));
