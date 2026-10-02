import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => {
  const { size, tile, tileRadius, ringOpacity, tintOpacity } = theme.sizes.systemIllustration;
  return {
    root: {
      width: size,
      height: size,
      alignItems: "center",
      justifyContent: "center",
    },
    ring: {
      position: "absolute",
      borderRadius: theme.radius.full,
      borderWidth: 1,
      opacity: ringOpacity,
      variants: {
        tone: {
          accent: { borderColor: theme.colors.accent.cyan },
          warning: { borderColor: theme.colors.status.warning },
        },
      },
    },
    tile: {
      width: tile,
      height: tile,
      borderRadius: tileRadius,
      borderWidth: 1,
      overflow: "hidden",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.bg.surface,
      variants: {
        tone: {
          accent: { borderColor: theme.colors.accent.cyan },
          warning: { borderColor: theme.colors.status.warning },
        },
      },
    },
    tint: {
      ...StyleSheet.absoluteFillObject,
      opacity: tintOpacity,
      variants: {
        tone: {
          accent: { backgroundColor: theme.colors.accent.cyan },
          warning: { backgroundColor: theme.colors.status.warning },
        },
      },
    },
  };
});
