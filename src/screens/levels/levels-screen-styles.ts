import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme, runtime) => ({
  screen: {
    flex: 1,
  },
  top: {
    paddingTop: runtime.insets.top,
    paddingHorizontal: theme.space[5],
  },
  offlinePanel: { gap: theme.space[2], padding: theme.space[4] },
  offline: {
    color: theme.colors.text.secondary,
    paddingVertical: theme.space[4],
  },
}));
