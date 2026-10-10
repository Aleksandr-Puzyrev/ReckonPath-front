import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  switch: {
    flexDirection: "row",
    alignSelf: "center",
    padding: theme.space[1],
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.bg.sunken,
  },
  option: {
    width: theme.sizes.touchTarget,
    height: theme.sizes.touchTarget,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.full,
  },
  selected: {
    backgroundColor: theme.colors.bg.surface,
  },
}));
