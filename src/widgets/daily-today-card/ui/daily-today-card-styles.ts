import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  card: {
    padding: theme.space[5],
    gap: theme.space[4],
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
  details: {
    flex: 1,
    gap: theme.space[2],
  },
  secondary: {
    color: theme.colors.text.secondary,
  },
  played: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space[4],
    paddingVertical: theme.space[4],
    paddingHorizontal: theme.space[5],
    borderRadius: theme.radius.l,
    borderWidth: 1,
    borderColor: theme.colors.status.success,
  },
  playedText: {
    flex: 1,
    gap: theme.space[2],
  },
}));
