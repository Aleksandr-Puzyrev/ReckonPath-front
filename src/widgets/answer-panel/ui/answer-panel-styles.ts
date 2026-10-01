import { StyleSheet } from "react-native-unistyles";

import type { AnswerTone } from "../model/describe-last-answer";

export const styles = StyleSheet.create((theme) => ({
  panel: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space[4],
  },
  texts: {
    flex: 1,
    gap: theme.space[1],
  },
  title: (tone: AnswerTone) => ({
    color: {
      normal: theme.colors.text.primary,
      hot: theme.colors.feedback.hot,
      warm: theme.colors.feedback.warm,
      cold: theme.colors.feedback.cold,
      danger: theme.colors.status.danger,
    }[tone],
  }),
  subtitle: {
    color: theme.colors.text.secondary,
  },
  flagButton: {
    width: theme.sizes.button.l,
    height: theme.sizes.button.l,
    borderRadius: theme.radius.l,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    alignItems: "center",
    justifyContent: "center",
    variants: {
      isFlagMode: {
        true: { backgroundColor: theme.colors.accent.pink, borderColor: theme.colors.accent.pink },
        false: { backgroundColor: theme.colors.bg.sunken },
      },
    },
  },
}));
