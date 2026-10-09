import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  bar: {
    gap: theme.space[3],
  },
  segments: {
    flexDirection: "row",
    gap: theme.space[2],
  },
  segment: {
    flex: 1,
    height: theme.sizes.strengthBar.height,
    borderRadius: theme.sizes.strengthBar.height / 2,
    backgroundColor: theme.colors.bg.sunken,
  },
  segmentOn: {
    variants: {
      strength: {
        weak: { backgroundColor: theme.colors.status.danger },
        fair: { backgroundColor: theme.colors.feedback.warm },
        good: { backgroundColor: theme.colors.status.warning },
        strong: { backgroundColor: theme.colors.status.success },
      },
    },
  },
  label: {
    color: theme.colors.text.secondary,
    variants: {
      strength: {
        weak: { color: theme.colors.status.danger },
        fair: { color: theme.colors.feedback.warm },
        good: { color: theme.colors.status.warning },
        strong: { color: theme.colors.status.success },
      },
    },
  },
}));
