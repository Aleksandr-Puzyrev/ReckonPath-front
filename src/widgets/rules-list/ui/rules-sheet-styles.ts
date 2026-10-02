import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  hint: {
    color: theme.colors.text.secondary,
  },
  row: {
    minHeight: theme.sizes.levelRow.height,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space[4],
    paddingHorizontal: theme.space[4],
    borderRadius: theme.radius.l,
    backgroundColor: theme.colors.bg.sunken,
  },
  texts: {
    flex: 1,
    gap: theme.space[1],
  },
}));
