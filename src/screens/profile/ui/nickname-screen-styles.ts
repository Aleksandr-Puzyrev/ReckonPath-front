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
  side: {
    width: theme.sizes.touchTarget,
  },
  content: {
    paddingHorizontal: theme.space[4],
    paddingBottom: runtime.insets.bottom + theme.space[6],
  },
}));
