import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme, runtime) => ({
  screen: {
    paddingTop: runtime.insets.top,
  },
  top: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space[3],
    minHeight: theme.sizes.topBar.height,
    paddingHorizontal: theme.space[4],
  },
  content: {
    gap: theme.space[3],
    paddingHorizontal: theme.space[4],
    paddingBottom: runtime.insets.bottom + theme.space[6],
  },
  secondary: {
    color: theme.colors.text.secondary,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space[3],
    padding: theme.space[3],
    borderRadius: theme.radius.l,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    backgroundColor: theme.colors.bg.surface,
  },
  pressed: {
    backgroundColor: theme.colors.bg.sunken,
  },
  rowTexts: {
    flex: 1,
    gap: theme.space[1],
  },
  sheet: {
    gap: theme.space[4],
    padding: theme.space[5],
  },
  preview: {
    alignSelf: "center",
  },
  status: {
    alignItems: "center",
    gap: theme.space[3],
    paddingVertical: theme.space[6],
  },
  skeleton: {
    height: theme.sizes.arena.switchMap + theme.space[6],
    borderRadius: theme.radius.l,
    backgroundColor: theme.colors.bg.sunken,
  },
}));
