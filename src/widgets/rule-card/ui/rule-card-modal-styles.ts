import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  backdrop: {
    flex: 1,
    justifyContent: "center",
    padding: theme.space[5],
    backgroundColor: theme.colors.bg.overlay,
  },
  card: {
    alignSelf: "center",
    width: "100%",
    maxWidth: theme.sizes.contentMaxWidth,
    gap: theme.space[4],
    padding: theme.space[6],
    borderRadius: theme.radius.xxl,
    backgroundColor: theme.colors.bg.surface,
    boxShadow: theme.elevation[2],
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  eyebrow: {
    color: theme.colors.accent.cyan,
  },
  counter: {
    color: theme.colors.text.secondary,
  },
  demo: {
    minHeight: theme.sizes.ruleCard.demoMinHeight,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.bg.sunken,
  },
  rule: {
    color: theme.colors.text.secondary,
  },
  pager: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space[3],
  },
  dots: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: theme.space[2],
  },
  dot: {
    width: theme.space[3],
    height: theme.space[3],
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.border.strong,
  },
  dotActive: {
    width: theme.space[6],
    backgroundColor: theme.colors.accent.cyan,
  },
}));
