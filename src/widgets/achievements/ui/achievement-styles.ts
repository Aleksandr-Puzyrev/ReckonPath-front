import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  list: { gap: theme.space[3] },
  card: {
    gap: theme.space[2],
    padding: theme.space[4],
    backgroundColor: theme.colors.bg.surface,
    borderRadius: theme.radius.l,
  },
}));
