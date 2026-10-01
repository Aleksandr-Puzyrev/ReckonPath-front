import { useEffect } from "react";
import { Appearance } from "react-native";
import type { ColorSchemeName } from "react-native";
import { UnistylesRuntime } from "react-native-unistyles";

export const themeNameFor = (scheme: ColorSchemeName | null | undefined) =>
  scheme === "light" ? "light" : "dark";

export const initialThemeName = () => themeNameFor(Appearance.getColorScheme());

// Unistyles adaptive themes miss system theme switches on Android, so the theme follows React Native's Appearance instead (адаптивные темы Unistyles пропускают смену темы системы на Android, поэтому тема следует Appearance из React Native).
export const useSystemTheme = () => {
  useEffect(() => {
    UnistylesRuntime.setTheme(initialThemeName());
    const subscription = Appearance.addChangeListener(({ colorScheme }) =>
      UnistylesRuntime.setTheme(themeNameFor(colorScheme)),
    );
    return () => subscription.remove();
  }, []);
};
