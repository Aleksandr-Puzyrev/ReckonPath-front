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
  warning: {
    color: theme.colors.status.warning,
  },
  params: {
    gap: theme.space[3],
    padding: theme.space[4],
    borderRadius: theme.radius.l,
    backgroundColor: theme.colors.bg.surface,
  },
  boardArea: {
    alignItems: "center",
    paddingLeft: theme.sizes.arena.coordinates,
  },
  palette: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -theme.space[1],
  },
  tileCell: {
    width: "20%",
    padding: theme.space[1],
  },
  sheet: {
    gap: theme.space[3],
    padding: theme.space[5],
  },
  code: {
    padding: theme.space[3],
    borderRadius: theme.radius.m,
    backgroundColor: theme.colors.bg.sunken,
  },
  actions: {
    flexDirection: "row",
    gap: theme.space[2],
  },
  action: {
    flex: 1,
  },
  failed: {
    flex: 1,
    gap: theme.space[3],
    alignItems: "center",
    justifyContent: "center",
    padding: theme.space[5],
  },
}));
