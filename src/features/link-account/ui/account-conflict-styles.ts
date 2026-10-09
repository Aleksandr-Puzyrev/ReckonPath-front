import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  conflict: {
    flexGrow: 1,
    gap: theme.space[4],
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space[3],
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
  },
  headerSpacer: {
    width: theme.sizes.iconButton.size,
  },
  title: {
    textAlign: "center",
  },
  description: {
    textAlign: "center",
    color: theme.colors.text.secondary,
  },
  actions: {
    marginTop: "auto",
    gap: theme.space[3],
  },
}));
