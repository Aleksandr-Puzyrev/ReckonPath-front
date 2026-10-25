import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme, runtime) => ({
  screen: {
    flex: 1,
  },
  top: {
    paddingTop: runtime.insets.top,
    paddingHorizontal: theme.space[4],
  },
  content: {
    gap: theme.space[3],
    paddingHorizontal: theme.space[5],
    paddingBottom: theme.space[7] + runtime.insets.bottom,
  },
  secondary: {
    color: theme.colors.text.secondary,
  },
  hintRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  link: {
    color: theme.colors.accent.cyan,
    paddingVertical: theme.space[2],
  },
  boardArea: {
    alignItems: "center",
    paddingLeft: theme.sizes.arena.coordinates,
  },
  tutorialHeader: {
    alignItems: "center",
    gap: theme.space[1],
  },
  tutorialSteps: {
    gap: theme.space[2],
    padding: theme.space[4],
    borderRadius: theme.radius.l,
    backgroundColor: theme.colors.bg.surface,
  },
  tutorialTool: {
    width: "50%",
    padding: theme.space[1],
  },
  palette: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -theme.space[1],
  },
  tileCell: {
    width: "33.333%",
    padding: theme.space[1],
  },
  footer: {
    flexDirection: "row",
    gap: theme.space[2],
  },
  footerMain: {
    flex: 1,
  },
  skeleton: {
    margin: theme.space[5],
    height: theme.sizes.arena.detailsMap * 2,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.bg.sunken,
  },
  failed: {
    flex: 1,
    gap: theme.space[3],
    alignItems: "center",
    justifyContent: "center",
    padding: theme.space[5],
  },
}));
