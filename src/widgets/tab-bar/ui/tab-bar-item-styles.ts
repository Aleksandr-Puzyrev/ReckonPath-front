import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.space[1],
    borderRadius: theme.radius.m,
    variants: {
      isActive: {
        true: { backgroundColor: theme.colors.bg.sunken },
      },
    },
  },
  dot: {
    position: "absolute",
    top: 0,
    right: 0,
    width: theme.sizes.friends.tabDot,
    height: theme.sizes.friends.tabDot,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.accent.pink,
  },
  label: {
    variants: {
      isActive: {
        true: { color: theme.colors.accent.cyan },
        false: { color: theme.colors.text.secondary },
      },
    },
  },
}));
