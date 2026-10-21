import { useLayoutEffect } from "react";
import { Appearance } from "react-native";
import type { ColorSchemeName } from "react-native";
import { UnistylesRuntime } from "react-native-unistyles";

export type ThemeChoice = "light" | "dark" | "system";

export const themeNameFor = (scheme: ColorSchemeName | null | undefined) =>
  scheme === "light" ? "light" : "dark";

export const initialThemeName = () => themeNameFor(Appearance.getColorScheme());

export const themeNameOf = (choice: ThemeChoice, scheme: ColorSchemeName | null | undefined) =>
  choice === "system" ? themeNameFor(scheme) : choice;

// A layout effect applies the chosen theme before the first paint, so it does not flash the system one (layout-эффект применяет выбранную тему до первой отрисовки, чтобы не мелькала системная).
// Unistyles adaptive themes miss system theme switches on Android, so the theme follows React Native's Appearance instead (адаптивные темы Unistyles пропускают смену темы системы на Android, поэтому тема следует Appearance из React Native).
export const useAppTheme = (choice: ThemeChoice) => {
  useLayoutEffect(() => {
    UnistylesRuntime.setTheme(themeNameOf(choice, Appearance.getColorScheme()));
    if (choice !== "system") return undefined;
    const subscription = Appearance.addChangeListener(({ colorScheme }) =>
      UnistylesRuntime.setTheme(themeNameFor(colorScheme)),
    );
    return () => subscription.remove();
  }, [choice]);
};
