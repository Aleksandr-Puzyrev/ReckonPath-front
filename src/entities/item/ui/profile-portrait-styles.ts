import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  root: {
    width: theme.sizes.avatar.profile,
    height: theme.sizes.avatar.profile,
  },
  avatar: { flex: 1, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  letter: { color: theme.colors.text.onAccent },
  texture: { position: "absolute", inset: 0 },
}));
