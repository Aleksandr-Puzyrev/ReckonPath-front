import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme, runtime) => ({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.bg.base,
  },
  content: {
    gap: theme.space[4],
    paddingTop: runtime.insets.top + theme.space[5],
    paddingBottom: runtime.insets.bottom + theme.space[6],
    paddingHorizontal: theme.space[4],
  },
  hero: {
    alignItems: "center",
    gap: theme.space[3],
    padding: theme.space[6],
    borderRadius: theme.radius.xxl,
    backgroundColor: theme.colors.bg.surface,
    boxShadow: theme.elevation[1],
  },
  card: {
    gap: theme.space[3],
    padding: theme.space[5],
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.bg.surface,
  },
  center: {
    textAlign: "center",
  },
  secondary: {
    textAlign: "center",
    color: theme.colors.text.secondary,
  },
  eyebrow: {
    color: theme.colors.text.secondary,
  },
  rewards: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.space[2],
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
  reset: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.space[3],
  },
  claimed: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.space[2],
    minHeight: theme.sizes.button.l,
  },
}));
