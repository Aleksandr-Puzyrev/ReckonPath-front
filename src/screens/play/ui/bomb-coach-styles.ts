import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  tile: {
    width: theme.sizes.bombCoach.tile,
    height: theme.sizes.bombCoach.tile,
    borderRadius: theme.sizes.bombCoach.tileRadius,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  tint: {
    ...StyleSheet.absoluteFillObject,
    opacity: theme.sizes.bombCoach.tintOpacity,
    backgroundColor: theme.colors.status.danger,
  },
}));
