import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  anchor: {
    position: "absolute",
    width: 0,
    alignItems: "center",
    paddingBottom: theme.space[3],
  },
  bubble: {
    position: "absolute",
    bottom: theme.space[3],
    paddingHorizontal: theme.space[4],
    paddingVertical: theme.space[3],
    borderRadius: theme.radius.s,
    backgroundColor: theme.colors.text.primary,
    boxShadow: theme.elevation[2],
  },
  text: {
    color: theme.colors.bg.base,
  },
}));
