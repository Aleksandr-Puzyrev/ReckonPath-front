import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space[3],
    minHeight: theme.sizes.touchTarget,
  },
  box: {
    width: theme.sizes.icon.m,
    height: theme.sizes.icon.m,
    borderRadius: theme.radius.xs,
    borderWidth: theme.sizes.checkbox.border,
    alignItems: "center",
    justifyContent: "center",
    variants: {
      isOn: {
        true: {
          borderColor: theme.colors.accent.cyan,
          backgroundColor: theme.colors.accent.cyan,
        },
        false: { borderColor: theme.colors.border.default },
      },
    },
  },
  label: {
    color: theme.colors.text.secondary,
  },
}));
