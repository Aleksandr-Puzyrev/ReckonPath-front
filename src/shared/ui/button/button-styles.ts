import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  button: {
    minHeight: theme.sizes.button.m,
    borderRadius: theme.radius.l,
    paddingHorizontal: theme.space[5],
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    variants: {
      size: {
        l: { minHeight: theme.sizes.button.l },
        m: { minHeight: theme.sizes.button.m },
        s: { minHeight: theme.sizes.button.s, paddingHorizontal: theme.space[4] },
      },
      variant: {
        primary: { backgroundColor: theme.colors.accent.cyan },
        secondary: {
          backgroundColor: theme.colors.bg.surface,
          borderWidth: 1,
          borderColor: theme.colors.border.default,
        },
        ghost: { backgroundColor: "transparent" },
        danger: { backgroundColor: theme.colors.status.danger },
      },
      isDisabled: {
        true: { backgroundColor: theme.colors.bg.sunken, borderColor: theme.colors.bg.sunken },
        false: {},
      },
    },
  },
  pressed: {
    transform: [{ scale: theme.motion.press.scale }],
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space[3],
  },
  label: {
    textAlign: "center",
    variants: {
      variant: {
        primary: { color: theme.colors.text.onAccent },
        secondary: { color: theme.colors.text.primary },
        ghost: { color: theme.colors.accent.cyan },
        danger: { color: theme.colors.text.onAccent },
      },
      isDisabled: {
        true: { color: theme.colors.text.disabled },
        false: {},
      },
    },
  },
  caption: {
    textAlign: "center",
    color: theme.colors.text.secondary,
  },
}));
