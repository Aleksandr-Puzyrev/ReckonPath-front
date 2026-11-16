import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme, runtime) => ({
  screen: {
    flex: 1,
    paddingTop: runtime.insets.top,
    paddingBottom: runtime.insets.bottom + theme.space[3],
    paddingHorizontal: theme.space[4],
    gap: theme.space[3],
  },
  flex: {
    flex: 1,
  },
  top: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space[3],
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space[3],
  },
  avatar: {
    width: theme.sizes.avatar.match - theme.sizes.timerRing.stroke * 2,
    height: theme.sizes.avatar.match - theme.sizes.timerRing.stroke * 2,
    borderRadius: theme.radius.full,
    alignItems: "center",
    justifyContent: "center",
    variants: {
      side: {
        me: { backgroundColor: theme.colors.player.me },
        opponent: { backgroundColor: theme.colors.player.opponent },
      },
    },
  },
  avatarLetter: {
    color: theme.colors.text.onAccent,
  },
  barTexts: {
    flex: 1,
    minWidth: 0,
  },
  barName: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space[1],
  },
  secondary: {
    color: theme.colors.text.secondary,
  },
  banner: {
    alignItems: "center",
    paddingVertical: theme.space[2],
    borderRadius: theme.radius.m,
    variants: {
      isMine: {
        true: { backgroundColor: theme.colors.player.me },
        false: { backgroundColor: theme.colors.bg.sunken },
      },
    },
  },
  bannerText: {
    variants: {
      isMine: {
        true: { color: theme.colors.text.inverse },
        false: { color: theme.colors.text.primary },
      },
    },
  },
  boardArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  turnLine: {
    textAlign: "center",
    color: theme.colors.text.secondary,
  },
  controls: {
    flexDirection: "row",
    gap: theme.space[2],
  },
  control: {
    flex: 1,
  },
  menu: {
    gap: theme.space[3],
    padding: theme.space[5],
  },
  prepare: {
    flex: 1,
    gap: theme.space[4],
  },
  prepareMap: {
    alignItems: "center",
    gap: theme.space[2],
  },
  prepareSources: {
    flexDirection: "row",
    gap: theme.space[2],
  },
  centered: {
    textAlign: "center",
  },
}));
