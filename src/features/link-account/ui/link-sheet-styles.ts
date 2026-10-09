import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  badge: {
    alignSelf: "center",
    width: theme.sizes.linkBadge.size,
    height: theme.sizes.linkBadge.size,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    textAlign: "center",
  },
  benefits: {
    gap: theme.space[3],
  },
  benefit: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space[4],
  },
  benefitText: {
    flex: 1,
  },
}));
