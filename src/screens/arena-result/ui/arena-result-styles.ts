import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme, runtime) => ({
  screen: {
    flex: 1,
  },
  content: {
    gap: theme.space[4],
    paddingTop: runtime.insets.top + theme.space[5],
    paddingBottom: runtime.insets.bottom + theme.space[5],
    paddingHorizontal: theme.space[5],
  },
  centered: {
    textAlign: "center",
  },
  secondary: {
    color: theme.colors.text.secondary,
  },
  maps: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: theme.space[3],
  },
  map: {
    alignItems: "center",
    gap: theme.space[2],
  },
  rewards: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: theme.space[3],
  },
  reward: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space[1],
    paddingVertical: theme.space[2],
    paddingHorizontal: theme.space[3],
    borderRadius: theme.radius.m,
    backgroundColor: theme.colors.bg.sunken,
  },
  zoom: {
    alignItems: "center",
    paddingBottom: theme.space[5],
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.space[4],
    padding: theme.space[5],
    backgroundColor: theme.colors.bg.base,
  },
}));
