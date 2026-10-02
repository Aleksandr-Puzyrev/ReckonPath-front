import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  header: {
    gap: theme.space[5],
    paddingBottom: theme.space[3],
  },
  starsChip: {
    minHeight: theme.sizes.chip.height,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space[2],
    paddingHorizontal: theme.space[4],
    borderRadius: theme.radius.s,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    backgroundColor: theme.colors.bg.surface,
  },
  buttons: {
    flexDirection: "row",
    gap: theme.space[3],
  },
  button: {
    flex: 1,
  },
}));
