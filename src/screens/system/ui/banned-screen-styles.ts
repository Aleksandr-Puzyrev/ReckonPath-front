import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme, runtime) => ({
  screen: {
    paddingTop: runtime.insets.top,
    paddingBottom: runtime.insets.bottom + theme.space[9],
  },
}));
