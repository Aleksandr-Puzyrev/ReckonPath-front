import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  bar: {
    flex: 1,
    height: theme.space[7],
    justifyContent: "flex-start",
  },
  track: {
    height: theme.space[3],
    borderRadius: theme.radius.xs,
    backgroundColor: theme.colors.bg.sunken,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: theme.radius.xs,
    backgroundColor: theme.colors.accent.cyan,
  },
  mark: {
    position: "absolute",
    top: -theme.space[2],
    alignItems: "center",
    width: 0,
  },
  tick: {
    width: theme.space[1],
    height: theme.space[5],
    backgroundColor: theme.colors.text.secondary,
  },
  markLabel: {
    flexDirection: "row",
    alignItems: "center",
    width: theme.space[8],
    justifyContent: "center",
  },
  markText: {
    color: theme.colors.text.secondary,
  },
}));
