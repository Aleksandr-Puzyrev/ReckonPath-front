import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  ring: {
    width: theme.sizes.timerRing.size,
    height: theme.sizes.timerRing.size,
    alignItems: "center",
    justifyContent: "center",
  },
  ringSvg: {
    position: "absolute",
  },
}));
