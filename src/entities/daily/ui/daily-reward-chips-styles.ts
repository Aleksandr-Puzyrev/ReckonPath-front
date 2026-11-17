import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  rewards: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.space[3],
  },
  reward: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space[1],
    paddingVertical: theme.space[2],
    paddingHorizontal: theme.space[3],
    borderRadius: theme.radius.m,
    backgroundColor: theme.colors.bg.sunken,
  },
}));
