import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme, runtime) => ({
  screen: {
    flex: 1,
  },
  view: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.space[4],
    paddingTop: runtime.insets.top,
    paddingBottom: runtime.insets.bottom + theme.space[5],
    paddingHorizontal: theme.space[5],
  },
  secondary: {
    color: theme.colors.text.secondary,
  },
  centered: {
    textAlign: "center",
  },
  actions: {
    alignSelf: "stretch",
    gap: theme.space[2],
  },
  radar: {
    width: theme.sizes.systemIllustration.size,
    height: theme.sizes.systemIllustration.size,
    alignItems: "center",
    justifyContent: "center",
  },
  radarRing: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: theme.radius.full,
    borderWidth: 2,
    borderColor: theme.colors.accent.cyan,
  },
  radarInner: {
    width: theme.sizes.systemIllustration.tile,
    height: theme.sizes.systemIllustration.tile,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.border.strong,
  },
  sweepHolder: {
    ...StyleSheet.absoluteFillObject,
  },
  sweep: {
    position: "absolute",
    left: "50%",
    top: 0,
    width: 2,
    height: "50%",
    backgroundColor: theme.colors.accent.cyan,
  },
  mapCard: {
    alignSelf: "stretch",
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space[3],
    padding: theme.space[3],
    borderRadius: theme.radius.l,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    backgroundColor: theme.colors.bg.surface,
  },
  mapTexts: {
    flex: 1,
    gap: theme.space[1],
  },
  versus: {
    flex: 1,
  },
  half: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.space[2],
    paddingHorizontal: theme.space[5],
    variants: {
      side: {
        opponent: { paddingTop: runtime.insets.top, backgroundColor: theme.colors.bg.sunken },
        me: { paddingBottom: runtime.insets.bottom, backgroundColor: theme.colors.bg.surface },
      },
    },
  },
  avatar: {
    width: theme.sizes.avatar.versus,
    height: theme.sizes.avatar.versus,
    borderRadius: theme.radius.xl,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    variants: {
      side: {
        opponent: { borderColor: theme.colors.player.opponent },
        me: { borderColor: theme.colors.player.me },
      },
    },
  },
  avatarLetter: {
    variants: {
      side: {
        opponent: { color: theme.colors.player.opponent },
        me: { color: theme.colors.player.me },
      },
    },
  },
  botLabel: {
    color: theme.colors.player.opponent,
  },
  vs: {
    textAlign: "center",
    paddingVertical: theme.space[2],
  },
  coin: {
    textAlign: "center",
    paddingVertical: theme.space[3],
  },
}));
