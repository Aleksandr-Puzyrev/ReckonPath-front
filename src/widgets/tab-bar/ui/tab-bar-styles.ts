import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme, runtime) => ({
  // The shadow is outside: overflow hidden would cut it off (тень снаружи: overflow hidden её обрежет).
  container: {
    position: "absolute",
    left: theme.sizes.tabBar.inset,
    right: theme.sizes.tabBar.inset,
    bottom: theme.sizes.tabBar.inset + runtime.insets.bottom,
    height: theme.sizes.tabBar.height,
    borderRadius: theme.sizes.tabBar.radius,
    boxShadow: theme.elevation[2],
  },
  surface: {
    flex: 1,
    flexDirection: "row",
    gap: theme.space[1],
    padding: theme.space[2],
    borderRadius: theme.sizes.tabBar.radius,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    backgroundColor: theme.colors.bg.glass,
    overflow: "hidden",
  },
}));
