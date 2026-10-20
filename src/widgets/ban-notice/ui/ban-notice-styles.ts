import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.space[4],
    paddingHorizontal: theme.space[7],
  },
  center: {
    textAlign: "center",
  },
  body: {
    textAlign: "center",
    color: theme.colors.text.secondary,
  },
  actions: {
    alignSelf: "stretch",
    gap: theme.space[3],
    marginTop: theme.space[3],
  },
}));
