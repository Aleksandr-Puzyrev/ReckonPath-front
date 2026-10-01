import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  card: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: theme.space[4],
    paddingVertical: theme.space[3],
    borderRadius: theme.radius.l,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    backgroundColor: theme.colors.bg.surface,
    boxShadow: theme.elevation[1],
    gap: theme.space[2],
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space[2],
  },
  label: {
    color: theme.colors.text.secondary,
  },
  value: {
    variants: {
      tone: {
        normal: { color: theme.colors.text.primary },
        warning: { color: theme.colors.status.warning },
        danger: { color: theme.colors.status.danger },
      },
    },
  },
}));
