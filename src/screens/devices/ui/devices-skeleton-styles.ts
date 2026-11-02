import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  row: {
    gap: theme.space[3],
    padding: theme.space[5],
  },
  line: {
    height: theme.sizes.icon.m,
    borderRadius: theme.radius.xs,
    backgroundColor: theme.colors.bg.sunken,
  },
  short: {
    width: "60%",
  },
}));
