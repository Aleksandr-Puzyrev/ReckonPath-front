import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme, runtime) => ({
  screen: {
    flex: 1,
    justifyContent: "space-between",
    paddingTop: runtime.insets.top + theme.space[10],
    paddingBottom: runtime.insets.bottom + theme.space[7],
    paddingHorizontal: theme.space[6],
    backgroundColor: theme.colors.bg.base,
  },
  texts: {
    gap: theme.space[4],
  },
  centered: {
    textAlign: "center",
  },
  body: {
    color: theme.colors.text.secondary,
  },
}));
