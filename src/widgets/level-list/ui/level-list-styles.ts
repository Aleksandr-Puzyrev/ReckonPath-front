import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme, runtime) => ({
  container: {
    flex: 1,
  },
  content: {
    paddingTop: theme.space[4],
    paddingHorizontal: theme.space[5],
    paddingBottom:
      runtime.insets.bottom +
      theme.sizes.tabBar.inset +
      theme.sizes.tabBar.height +
      theme.space[10],
  },
  row: {
    paddingTop: theme.space[3],
  },
}));
