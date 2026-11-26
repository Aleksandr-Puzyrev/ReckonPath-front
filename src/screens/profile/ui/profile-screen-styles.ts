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
  stats: { gap: theme.space[2] },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: theme.space[2] },
  stat: {
    flexGrow: 1,
    flexBasis: "40%",
    gap: theme.space[1],
    padding: theme.space[3],
    backgroundColor: theme.colors.bg.surface,
    borderRadius: theme.radius.m,
  },
  section: {
    color: theme.colors.text.secondary,
  },
}));
