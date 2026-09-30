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
  label: {
    variants: {
      isActive: {
        true: { color: theme.colors.accent.cyan },
        false: { color: theme.colors.text.secondary },
      },
    },
  },
}));
