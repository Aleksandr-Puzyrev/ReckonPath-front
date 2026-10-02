import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme, runtime) => ({
  screen: {
    paddingTop: runtime.insets.top + theme.space[5],
    paddingHorizontal: theme.space[5],
  },
}));
