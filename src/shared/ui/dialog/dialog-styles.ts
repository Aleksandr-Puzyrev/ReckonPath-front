import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  backdrop: {
    flex: 1,
    backgroundColor: theme.colors.bg.overlay,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.space[7],
  },
  card: {
    width: "100%",
    maxWidth: theme.sizes.contentMaxWidth,
    borderRadius: theme.radius.xxl,
    backgroundColor: theme.colors.bg.surface,
    padding: theme.space[6],
    gap: theme.space[6],
    boxShadow: theme.elevation[2],
  },
  title: {
    textAlign: "center",
  },
  actions: {
    flexDirection: "row",
    gap: theme.space[3],
  },
  action: {
    flex: 1,
  },
}));
