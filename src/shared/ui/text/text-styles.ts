import { StyleSheet } from "react-native-unistyles";

import type { AppTheme, TypographyVariant } from "@shared/theme";

export const styles = StyleSheet.create((theme) => ({
  text: {
    color: theme.colors.text.primary,
    variants: {
      // Object.fromEntries loses the key type (Object.fromEntries теряет тип ключей).
      variant: Object.fromEntries(
        Object.entries(theme.typography).map(([name, type]) => [name, type.style]),
      ) as Record<TypographyVariant, AppTheme["typography"][TypographyVariant]["style"]>,
    },
  },
}));
