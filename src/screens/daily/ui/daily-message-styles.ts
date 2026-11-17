import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  container: {
    alignItems: "center",
    gap: theme.space[5],
    paddingVertical: theme.space[7],
  },
  text: {
    textAlign: "center",
  },
}));
