import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  wrap: {
    alignItems: "center",
  },
  letters: {
    height: theme.sizes.arena.coordinates,
    marginLeft: theme.sizes.arena.coordinates,
  },
  label: {
    position: "absolute",
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
  },
  numbers: {
    width: theme.sizes.arena.coordinates,
  },
  number: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: theme.colors.text.secondary,
  },
}));
