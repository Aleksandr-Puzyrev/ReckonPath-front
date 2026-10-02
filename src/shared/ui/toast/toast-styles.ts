import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme, runtime) => ({
  toast: {
    position: "absolute",
    left: theme.space[5],
    right: theme.space[5],
    bottom:
      runtime.insets.bottom +
      theme.sizes.tabBar.inset +
      theme.sizes.tabBar.height +
      theme.sizes.toast.offset,
    minHeight: theme.sizes.toast.minHeight,
    justifyContent: "center",
    paddingHorizontal: theme.space[5],
    paddingVertical: theme.space[4],
    borderRadius: theme.radius.m,
    backgroundColor: theme.colors.bg.toast,
    boxShadow: theme.elevation[2],
  },
  text: {
    color: theme.colors.text.inverse,
    textAlign: "center",
  },
}));
