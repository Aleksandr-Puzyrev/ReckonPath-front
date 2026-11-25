import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space[4],
    minHeight: theme.sizes.touchTarget,
    paddingHorizontal: theme.space[4],
    variants: {
      kind: {
        card: {
          paddingVertical: theme.space[2],
          borderRadius: theme.radius.l,
          borderWidth: 1,
          borderColor: theme.colors.border.default,
          backgroundColor: theme.colors.bg.surface,
        },
        plain: {
          borderRadius: theme.radius.m,
        },
      },
      isMine: {
        true: { borderColor: theme.colors.accent.cyan },
      },
    },
  },
  pressed: {
    backgroundColor: theme.colors.bg.sunken,
  },
  name: {
    flex: 1,
    variants: {
      isMine: {
        true: { color: theme.colors.accent.cyan },
      },
    },
  },
  value: {
    fontVariant: ["tabular-nums"],
  },
}));
