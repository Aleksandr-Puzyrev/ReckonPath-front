import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme, runtime) => ({
  screen: {
    flex: 1,
  },
  topBar: {
    paddingTop: runtime.insets.top,
    paddingHorizontal: theme.space[5],
    minHeight: theme.sizes.topBar.height + runtime.insets.top,
    justifyContent: "center",
  },
  content: {
    gap: theme.space[4],
    paddingHorizontal: theme.space[5],
    paddingBottom: runtime.insets.bottom + theme.space[9],
  },
}));
