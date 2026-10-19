import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme, runtime) => ({
  screen: {
    flex: 1,
  },
  top: {
    paddingTop: runtime.insets.top,
    paddingHorizontal: theme.space[4],
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space[1],
  },
  name: {
    flex: 1,
    minHeight: theme.sizes.touchTarget,
    justifyContent: "center",
  },
  content: {
    gap: theme.space[3],
    paddingHorizontal: theme.space[5],
    paddingBottom: theme.space[7] + runtime.insets.bottom,
  },
  secondary: {
    color: theme.colors.text.secondary,
  },
  hintRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  link: {
    color: theme.colors.accent.cyan,
    paddingVertical: theme.space[2],
  },
  boardArea: {
    alignItems: "center",
    paddingLeft: theme.sizes.arena.coordinates,
  },
  status: {
    paddingVertical: theme.space[2],
    paddingHorizontal: theme.space[3],
    borderRadius: theme.radius.m,
    backgroundColor: theme.colors.bg.sunken,
  },
  statusText: {
    variants: {
      isValid: {
        true: { color: theme.colors.status.success },
        false: { color: theme.colors.status.danger },
      },
    },
  },
  palette: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -theme.space[1],
  },
  tileCell: {
    width: "33.333%",
    padding: theme.space[1],
  },
  tile: {
    minHeight: theme.sizes.button.l,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.space[1],
    borderRadius: theme.radius.m,
    borderWidth: 1,
    backgroundColor: theme.colors.bg.surface,
    variants: {
      isSelected: {
        true: { borderColor: theme.colors.accent.cyan },
        false: { borderColor: theme.colors.border.default },
      },
    },
  },
  counter: {
    variants: {
      isFull: {
        true: { color: theme.colors.status.warning },
        false: { color: theme.colors.text.secondary },
      },
    },
  },
  footer: {
    flexDirection: "row",
    gap: theme.space[2],
  },
  footerMain: {
    flex: 1,
  },
  skeleton: {
    margin: theme.space[5],
    height: theme.sizes.arena.detailsMap * 2,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.bg.sunken,
  },
  failed: {
    flex: 1,
    gap: theme.space[3],
    alignItems: "center",
    justifyContent: "center",
    padding: theme.space[5],
  },
}));
