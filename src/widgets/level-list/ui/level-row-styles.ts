import { StyleSheet } from "react-native-unistyles";

const LOCKED_OPACITY = 0.55;

export const styles = StyleSheet.create((theme) => ({
  row: {
    minHeight: theme.sizes.levelRow.height,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space[4],
    paddingHorizontal: theme.space[4],
    paddingVertical: theme.space[3],
    borderRadius: theme.radius.l,
    borderWidth: 1.5,
    borderColor: theme.colors.border.default,
    backgroundColor: theme.colors.bg.surface,
    variants: {
      state: {
        done: {},
        current: { borderColor: theme.colors.feedback.warm, boxShadow: theme.glow.hot },
        locked: { opacity: LOCKED_OPACITY },
      },
    },
  },
  pressed: {
    transform: [{ scale: theme.motion.press.scale }],
  },
  tile: {
    width: theme.sizes.levelRow.tile,
    height: theme.sizes.levelRow.tile,
    borderRadius: theme.radius.m,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    variants: {
      state: {
        done: {},
        current: {},
        locked: { backgroundColor: theme.colors.bg.sunken },
      },
    },
  },
  tileNumber: {
    color: theme.colors.text.onAccent,
  },
  texts: {
    flex: 1,
    gap: theme.space[1],
  },
  description: {
    color: theme.colors.text.secondary,
  },
  play: {
    minHeight: theme.sizes.chip.height,
    paddingHorizontal: theme.space[4],
    borderRadius: theme.radius.s,
    justifyContent: "center",
    overflow: "hidden",
  },
  playText: {
    color: theme.colors.text.onAccent,
  },
}));
