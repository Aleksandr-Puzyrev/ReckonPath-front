import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  card: {
    gap: theme.space[2],
    padding: theme.space[5],
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    backgroundColor: theme.colors.bg.surface,
  },
  kind: {
    color: theme.colors.text.secondary,
  },
  stats: {
    flexDirection: "row",
    gap: theme.space[3],
    marginTop: theme.space[3],
  },
  stat: {
    flex: 1,
    paddingVertical: theme.space[3],
    paddingHorizontal: theme.space[4],
    borderRadius: theme.radius.s,
    backgroundColor: theme.colors.bg.sunken,
  },
  statLabel: {
    color: theme.colors.text.secondary,
  },
}));
