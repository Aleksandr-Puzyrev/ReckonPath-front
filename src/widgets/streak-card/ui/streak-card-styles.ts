import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  card: {
    padding: theme.space[5],
    gap: theme.space[5],
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    backgroundColor: theme.colors.bg.surface,
    boxShadow: theme.elevation[1],
  },
  summary: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space[4],
  },
  secondary: {
    color: theme.colors.text.secondary,
  },
  track: {
    height: theme.sizes.daily.track,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.bg.sunken,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.feedback.warm,
  },
  milestones: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
}));
