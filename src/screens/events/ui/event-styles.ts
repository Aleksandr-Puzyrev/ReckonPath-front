import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme, runtime) => ({
  screen: { paddingTop: runtime.insets.top, paddingBottom: runtime.insets.bottom },
  content: { padding: theme.space[4], gap: theme.space[4] },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space[3],
    paddingHorizontal: theme.space[4],
    paddingVertical: theme.space[2],
  },
  title: { flex: 1 },
  card: {
    gap: theme.space[2],
    padding: theme.space[4],
    borderRadius: theme.radius.l,
    backgroundColor: theme.colors.bg.surface,
  },
  section: { gap: theme.space[2] },
  row: { flexDirection: "row", alignItems: "center", gap: theme.space[3] },
  player: { flex: 1 },
  board: { flex: 1, alignItems: "center", justifyContent: "center" },
  footer: { gap: theme.space[2], paddingHorizontal: theme.space[4] },
}));
