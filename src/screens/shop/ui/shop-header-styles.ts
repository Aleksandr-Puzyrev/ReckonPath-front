import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  header: {
    gap: theme.space[5],
    paddingHorizontal: theme.space[2],
    paddingBottom: theme.space[4],
  },
  updated: {
    color: theme.colors.text.secondary,
    textAlign: "center",
  },
  controls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tabTitle: {
    color: theme.colors.text.secondary,
  },
}));
