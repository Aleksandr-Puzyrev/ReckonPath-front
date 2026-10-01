import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  button: {
    width: theme.sizes.iconButton.size,
    height: theme.sizes.iconButton.size,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    backgroundColor: theme.colors.bg.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    transform: [{ scale: theme.motion.press.scale }],
  },
}));
