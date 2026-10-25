import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space[1],
  },
  name: {
    flex: 1,
    minHeight: theme.sizes.touchTarget,
    justifyContent: "center",
  },
  status: {
    paddingVertical: theme.space[2],
    paddingHorizontal: theme.space[3],
    borderRadius: theme.radius.m,
    backgroundColor: theme.colors.bg.sunken,
  },
  statusText: {
    variants: {
      isValid: {
        true: { color: theme.colors.status.success },
        false: { color: theme.colors.status.danger },
      },
    },
  },
  tile: {
    minHeight: theme.sizes.button.l,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.space[1],
    borderRadius: theme.radius.m,
    borderWidth: 1,
    backgroundColor: theme.colors.bg.surface,
    variants: {
      isSelected: {
        true: { borderColor: theme.colors.accent.cyan },
        false: { borderColor: theme.colors.border.default },
      },
    },
  },
  counter: {
    variants: {
      isFull: {
        true: { color: theme.colors.status.warning },
        false: { color: theme.colors.text.secondary },
      },
    },
  },
}));
