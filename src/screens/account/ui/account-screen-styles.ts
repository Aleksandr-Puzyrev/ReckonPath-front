import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme, runtime) => ({
  content: {
    flexGrow: 1,
    paddingTop: runtime.insets.top + theme.space[3],
    paddingHorizontal: theme.space[6],
    paddingBottom: runtime.insets.bottom + theme.space[7],
  },
}));
