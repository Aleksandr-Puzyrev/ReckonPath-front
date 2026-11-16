import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme, runtime) => ({
  screen: {
    flex: 1,
  },
  secondary: {
    color: theme.colors.text.secondary,
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
