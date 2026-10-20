import { StyleSheet } from "react-native-unistyles";

const MULTILINE_ROWS = 3;

export const styles = StyleSheet.create((theme) => ({
  field: {
    gap: theme.space[3],
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  label: {
    color: theme.colors.text.secondary,
  },
  counter: {
    color: theme.colors.text.secondary,
    fontVariant: ["tabular-nums"],
  },
  input: {
    ...theme.typography["body.l"].style,
    height: theme.sizes.input.height,
    borderRadius: theme.radius.m,
    borderWidth: theme.sizes.input.border,
    borderColor: theme.colors.border.default,
    backgroundColor: theme.colors.bg.sunken,
    color: theme.colors.text.primary,
    paddingHorizontal: theme.space[5],
    variants: {
      isFocused: {
        true: { borderColor: theme.colors.focus.ring },
        false: {},
      },
      hasError: {
        true: { borderColor: theme.colors.status.danger },
        false: {},
      },
      hasToggle: {
        true: { paddingRight: theme.sizes.touchTarget * 2 },
        false: {},
      },
      isMultiline: {
        true: {
          height: theme.sizes.input.height * MULTILINE_ROWS,
          paddingVertical: theme.space[4],
          textAlignVertical: "top",
        },
        false: {},
      },
    },
  },
  toggle: {
    position: "absolute",
    right: theme.space[2],
    top: 0,
    bottom: 0,
    minWidth: theme.sizes.touchTarget,
    paddingHorizontal: theme.space[4],
    justifyContent: "center",
  },
  toggleLabel: {
    color: theme.colors.accent.cyan,
  },
  error: {
    color: theme.colors.status.danger,
  },
}));
