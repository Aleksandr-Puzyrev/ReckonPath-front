import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space[3],
  },
  area: {
    flex: 1,
    height: theme.sizes.touchTarget,
    justifyContent: "center",
  },
  track: {
    height: theme.sizes.settings.sliderTrack,
    borderRadius: theme.radius.full,
    overflow: "hidden",
    backgroundColor: theme.colors.bg.sunken,
  },
  fill: {
    height: "100%",
    backgroundColor: theme.colors.accent.cyan,
  },
  thumb: {
    position: "absolute",
    width: theme.sizes.settings.sliderThumb,
    height: theme.sizes.settings.sliderThumb,
    marginLeft: -theme.sizes.settings.sliderThumb / 2,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.bg.surface,
    boxShadow: theme.elevation[1],
  },
  value: {
    minWidth: theme.sizes.touchTarget,
    textAlign: "right",
    color: theme.colors.text.secondary,
  },
}));
