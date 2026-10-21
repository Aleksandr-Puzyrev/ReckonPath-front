import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme, runtime) => ({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.bg.overlay,
    paddingHorizontal: theme.space[5],
  },
  hero: {
    marginTop: runtime.insets.top + theme.sizes.topBar.height + theme.space[3],
  },
  tabs: {
    marginTop: "auto",
    marginBottom: runtime.insets.bottom + theme.sizes.tabBar.height + theme.space[3],
  },
}));
