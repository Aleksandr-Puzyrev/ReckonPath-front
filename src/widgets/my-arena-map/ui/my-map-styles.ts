import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  card: {
    flexDirection: "row",
    gap: theme.space[4],
    padding: theme.space[4],
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    backgroundColor: theme.colors.bg.surface,
  },
  texts: {
    flex: 1,
    minWidth: 0,
    gap: theme.space[1],
  },
  secondary: {
    color: theme.colors.text.secondary,
  },
  disabled: {
    color: theme.colors.text.disabled,
  },
  actions: {
    flexDirection: "row",
    gap: theme.space[2],
    marginTop: theme.space[2],
  },
  action: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space[3],
    padding: theme.space[3],
    borderRadius: theme.radius.l,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    variants: {
      isActive: {
        true: { borderColor: theme.colors.accent.cyan },
      },
    },
  },
  sheet: {
    gap: theme.space[3],
    paddingHorizontal: theme.space[5],
    paddingBottom: theme.space[5],
  },
}));
