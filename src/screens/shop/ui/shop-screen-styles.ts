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
    paddingHorizontal: theme.space[3],
    paddingTop: theme.space[4],
    paddingBottom: theme.sizes.tabBar.height + theme.sizes.tabBar.inset + runtime.insets.bottom,
  },
  cell: {
    flex: 1,
    padding: theme.space[2],
  },
}));
