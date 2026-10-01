import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme, runtime) => ({
  screen: {
    paddingTop: runtime.insets.top + theme.space[3],
    paddingBottom: runtime.insets.bottom + theme.space[5],
    paddingHorizontal: theme.space[5],
    gap: theme.space[4],
  },
  boardArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
}));
