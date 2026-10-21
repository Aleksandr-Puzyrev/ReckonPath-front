import { StyleSheet } from "react-native-unistyles";

import { darkTheme } from "@shared/theme";

// The splash stays dark in both themes, like the native one (сплэш тёмный в обеих темах, как системный).
export const styles = StyleSheet.create((theme, runtime) => ({
  splash: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.space[5],
    backgroundColor: darkTheme.colors.bg.base,
  },
  stage: {
    width: theme.sizes.splash.ring,
    height: theme.sizes.splash.ring,
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    position: "absolute",
    width: theme.sizes.splash.ring,
    height: theme.sizes.splash.ring,
    borderRadius: theme.radius.full,
    borderWidth: theme.sizes.splash.ringStroke,
    borderColor: darkTheme.colors.accent.cyan,
  },
  emblem: {
    width: theme.sizes.splash.emblem,
    height: theme.sizes.splash.emblem,
  },
  brand: {
    alignItems: "center",
    gap: theme.space[1],
  },
  title: {
    color: darkTheme.colors.text.primary,
  },
  accent: {
    color: darkTheme.colors.accent.cyan,
  },
  tagline: {
    color: darkTheme.colors.text.secondary,
  },
  banner: {
    position: "absolute",
    top: runtime.insets.top + theme.space[2],
    alignSelf: "center",
    paddingVertical: theme.space[2],
    paddingHorizontal: theme.space[4],
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.bg.toast,
  },
  bannerText: {
    color: theme.colors.text.inverse,
  },
}));
