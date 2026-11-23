import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  link: {
    minHeight: theme.sizes.touchTarget,
    justifyContent: "center",
    borderRadius: theme.radius.m,
  },
  pressed: {
    backgroundColor: theme.colors.bg.sunken,
  },
}));
