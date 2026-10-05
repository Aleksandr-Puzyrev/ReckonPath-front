import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme, runtime) => ({
  screen: {
    flex: 1,
  },
  top: {
    paddingTop: runtime.insets.top,
    paddingHorizontal: theme.space[5],
  },
}));
