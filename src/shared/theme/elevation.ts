import type { BoxShadowValue } from "react-native";

type Shadow = BoxShadowValue[];

const shadow = (offsetY: number, blurRadius: number, color: string, spreadDistance = 0) => ({
  offsetX: 0,
  offsetY,
  blurRadius,
  spreadDistance,
  color,
});

export const lightElevation = {
  1: [shadow(8, 24, "rgba(32,69,91,0.10)")],
  2: [shadow(14, 40, "rgba(20,55,75,0.18)")],
  3: [shadow(-20, 60, "rgba(0,0,0,0.25)")],
  hero: [shadow(25, 55, "rgba(40,75,125,0.25)")],
} satisfies Record<string, Shadow>;

export type ThemeElevation = typeof lightElevation;

export const darkElevation: ThemeElevation = {
  1: [shadow(10, 28, "rgba(0,0,0,0.30)")],
  2: [shadow(14, 40, "rgba(0,0,0,0.40)")],
  3: [shadow(-20, 60, "rgba(0,0,0,0.45)")],
  hero: [shadow(25, 55, "rgba(40,75,125,0.25)")],
};

export const glow = {
  primary: [shadow(11, 23, "rgba(75,130,222,0.22)")],
  target: [shadow(0, 0, "rgba(255,204,85,0.18)", 6), shadow(18, 36, "rgba(255,143,76,0.30)")],
  hot: [shadow(0, 0, "rgba(255,104,93,0.13)", 5), shadow(12, 22, "rgba(255,104,93,0.23)")],
} satisfies Record<string, Shadow>;
