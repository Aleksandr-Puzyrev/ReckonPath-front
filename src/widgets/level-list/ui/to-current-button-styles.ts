import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme, runtime) => ({
  anchor: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom:
      runtime.insets.bottom +
      theme.sizes.tabBar.inset +
      theme.sizes.tabBar.height +
      theme.sizes.toast.offset,
    alignItems: "center",
  },
  button: {
    minHeight: theme.sizes.floatingButton.height,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space[3],
    paddingHorizontal: theme.space[5],
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.bg.toast,
    boxShadow: theme.elevation[2],
  },
  text: {
    color: theme.colors.text.inverse,
  },
}));
