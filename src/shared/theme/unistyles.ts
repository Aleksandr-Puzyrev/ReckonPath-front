import { StyleSheet } from "react-native-unistyles";

import { initialThemeName } from "./system-theme";
import { appThemes } from "./themes";
import type { AppThemes } from "./themes";

declare module "react-native-unistyles" {
  // Unistyles theme typing requires an empty interface (типизация тем Unistyles требует пустой интерфейс).
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface UnistylesThemes extends AppThemes {}
}

StyleSheet.configure({
  themes: appThemes,
  settings: { initialTheme: initialThemeName },
});
