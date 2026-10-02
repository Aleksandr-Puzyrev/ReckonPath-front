import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  screen: {
    alignItems: "center",
    justifyContent: "center",
    gap: theme.space[6],
    padding: theme.space[7],
  },
  text: {
    textAlign: "center",
  },
}));
