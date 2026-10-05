import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme, runtime) => ({
  screen: {
    paddingTop: runtime.insets.top,
    paddingHorizontal: theme.space[5],
    gap: theme.space[4],
  },
}));
