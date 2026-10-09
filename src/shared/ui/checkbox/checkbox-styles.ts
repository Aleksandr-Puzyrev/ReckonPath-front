import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  field: {
    gap: theme.space[3],
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.space[4],
    minHeight: theme.sizes.touchTarget,
  },
  box: {
    width: theme.sizes.checkbox.size,
    height: theme.sizes.checkbox.size,
    borderRadius: theme.radius.xs,
    borderWidth: theme.sizes.checkbox.border,
    borderColor: theme.colors.text.secondary,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    variants: {
      isChecked: {
        true: { borderColor: "transparent" },
        false: {},
      },
      hasError: {
        true: { borderColor: theme.colors.status.danger },
        false: {},
      },
    },
  },
  label: {
    flex: 1,
    color: theme.colors.text.secondary,
  },
  error: {
    color: theme.colors.status.danger,
  },
}));
