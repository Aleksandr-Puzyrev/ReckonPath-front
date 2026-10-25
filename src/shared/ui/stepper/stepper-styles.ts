import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space[3],
  },
  label: {
    flex: 1,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space[2],
    padding: theme.space[1],
    borderRadius: theme.radius.m,
    backgroundColor: theme.colors.bg.sunken,
  },
  button: {
    width: theme.sizes.touchTarget,
    height: theme.sizes.touchTarget,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.s,
  },
  pressed: {
    backgroundColor: theme.colors.bg.surface,
  },
  value: {
    minWidth: theme.sizes.touchTarget,
    textAlign: "center",
  },
}));
