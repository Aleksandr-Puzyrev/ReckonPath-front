import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme, runtime) => ({
  screen: {
    gap: theme.space[4],
    paddingTop: runtime.insets.top + theme.space[3],
    paddingBottom: runtime.insets.bottom + theme.space[4],
    paddingHorizontal: theme.space[5],
  },
  top: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space[3],
  },
  title: {
    flex: 1,
  },
  field: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: theme.space[2],
  },
  input: {
    flex: 1,
  },
  preview: {
    gap: theme.space[3],
    padding: theme.space[4],
    borderRadius: theme.radius.l,
    backgroundColor: theme.colors.bg.surface,
  },
  previewHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space[3],
  },
  previewTexts: {
    flex: 1,
    gap: theme.space[1],
  },
  eyebrow: {
    color: theme.colors.accent.cyan,
  },
  secondary: {
    color: theme.colors.text.secondary,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.space[2],
  },
  challenge: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
}));
