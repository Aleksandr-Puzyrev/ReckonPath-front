import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space[4],
    minHeight: theme.sizes.touchTarget,
    paddingHorizontal: theme.space[3],
    borderRadius: theme.radius.m,
    variants: {
      isMine: {
        true: { backgroundColor: theme.colors.bg.sunken },
      },
    },
  },
  name: {
    flex: 1,
    variants: {
      isMine: {
        true: { color: theme.colors.accent.cyan },
      },
    },
  },
}));
