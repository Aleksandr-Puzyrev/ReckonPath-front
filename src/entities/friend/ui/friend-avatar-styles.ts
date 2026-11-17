import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  avatar: {
    alignItems: "center",
    justifyContent: "center",
    variants: {
      size: {
        list: { width: theme.sizes.avatar.list, height: theme.sizes.avatar.list },
        match: { width: theme.sizes.avatar.match, height: theme.sizes.avatar.match },
      },
    },
  },
  letter: {
    color: theme.colors.text.onAccent,
  },
  dot: {
    position: "absolute",
    right: -theme.sizes.friends.statusBorder,
    bottom: -theme.sizes.friends.statusBorder,
    width: theme.sizes.friends.statusDot,
    height: theme.sizes.friends.statusDot,
    borderRadius: theme.radius.full,
    borderWidth: theme.sizes.friends.statusBorder,
    borderColor: theme.colors.bg.surface,
    variants: {
      status: {
        online: { backgroundColor: theme.colors.status.success },
        in_match: { backgroundColor: theme.colors.status.warning },
        offline: { backgroundColor: theme.colors.text.secondary },
      },
    },
  },
}));
