import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space[4],
  },
  badge: {
    width: theme.sizes.softUpdateBadge.size,
    height: theme.sizes.softUpdateBadge.size,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    flex: 1,
  },
  message: {
    color: theme.colors.text.secondary,
  },
  actions: {
    flexDirection: "row",
    gap: theme.space[3],
  },
  later: {
    flex: 2,
  },
  update: {
    flex: 3,
  },
}));
