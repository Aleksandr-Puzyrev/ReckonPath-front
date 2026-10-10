import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  success: {
    alignItems: "center",
    gap: theme.space[3],
  },
  preview: {
    width: theme.sizes.shop.previewVisual,
  },
  title: {
    color: theme.colors.status.success,
  },
  centered: {
    textAlign: "center",
  },
  balance: {
    color: theme.colors.text.secondary,
  },
  actions: {
    alignSelf: "stretch",
    flexDirection: "row",
    gap: theme.space[3],
  },
  later: {
    flex: 2,
  },
  equip: {
    flex: 3,
  },
}));
