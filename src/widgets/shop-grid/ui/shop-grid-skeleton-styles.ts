import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  grid: {
    gap: theme.space[4],
  },
  row: {
    flexDirection: "row",
    gap: theme.space[4],
  },
  card: {
    flex: 1,
    aspectRatio: theme.sizes.shop.skeletonCardRatio,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.bg.sunken,
  },
}));
