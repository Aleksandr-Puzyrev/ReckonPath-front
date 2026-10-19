import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  progress: {
    gap: theme.space[2],
  },
  texts: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  text: {
    variants: {
      isOnHero: {
        true: { color: theme.colors.text.onAccent },
        false: { color: theme.colors.text.secondary },
      },
    },
  },
  track: {
    height: theme.sizes.arena.progress,
    borderRadius: theme.radius.full,
    overflow: "hidden",
    variants: {
      isOnHero: {
        true: { backgroundColor: theme.colors.bg.overlay },
        false: { backgroundColor: theme.colors.bg.sunken },
      },
    },
  },
  fill: {
    height: "100%",
    borderRadius: theme.radius.full,
  },
}));
