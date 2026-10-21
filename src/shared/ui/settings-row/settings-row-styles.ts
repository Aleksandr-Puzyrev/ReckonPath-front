import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  row: {
    gap: theme.space[3],
    paddingVertical: theme.space[3],
    paddingHorizontal: theme.space[4],
  },
  pressed: {
    backgroundColor: theme.colors.bg.sunken,
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.default,
  },
  main: {
    minHeight: theme.sizes.touchTarget,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space[3],
  },
  tile: {
    width: theme.sizes.settings.iconTile,
    height: theme.sizes.settings.iconTile,
    borderRadius: theme.sizes.settings.iconTileRadius,
    alignItems: "center",
    justifyContent: "center",
  },
  texts: {
    flex: 1,
  },
  label: {
    variants: {
      isDestructive: {
        true: { color: theme.colors.status.danger },
        false: { color: theme.colors.text.primary },
      },
    },
  },
  subtitle: {
    color: theme.colors.text.secondary,
  },
  extra: {
    marginLeft: theme.sizes.settings.iconTile + theme.space[3],
  },
}));
