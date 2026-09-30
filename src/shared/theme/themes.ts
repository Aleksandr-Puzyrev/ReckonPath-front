import { darkColors, lightColors } from "./colors";
import { darkElevation, glow, lightElevation } from "./elevation";
import { gradients } from "./gradients";
import { motion } from "./motion";
import { radius } from "./radius";
import { sizes } from "./sizes";
import { space } from "./space";
import { typography } from "./typography";

const sharedTokens = { gradients, glow, space, radius, sizes, typography, motion };

export const lightTheme = { colors: lightColors, elevation: lightElevation, ...sharedTokens };

export type AppTheme = typeof lightTheme;

export const darkTheme: AppTheme = {
  colors: darkColors,
  elevation: darkElevation,
  ...sharedTokens,
};

export const appThemes = { light: lightTheme, dark: darkTheme };

export type AppThemes = typeof appThemes;
