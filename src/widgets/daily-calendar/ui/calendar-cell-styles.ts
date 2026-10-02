import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  cell: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: theme.radius.s,
    alignItems: "center",
    justifyContent: "center",
    variants: {
      result: {
        won: { backgroundColor: theme.colors.status.success },
        lost: {
          backgroundColor: theme.colors.bg.sunken,
          borderWidth: 2,
          borderColor: theme.colors.status.danger,
        },
        restored: { backgroundColor: theme.colors.bg.sunken },
        none: { backgroundColor: theme.colors.bg.sunken },
        padding: { backgroundColor: "transparent" },
      },
      isToday: {
        true: { borderWidth: 2, borderColor: theme.colors.accent.cyan },
      },
    },
  },
}));
