import { apiAssetUrl } from "@shared/api";

import type { ShopItemView } from "./item-type";

export interface AnimationTheme {
  url: string;
  colorFilters: { keypath: string; color: string }[];
}

export interface ShopAnimation {
  light: AnimationTheme;
  dark: AnimationTheme;
  loop: boolean;
}

const LOTTIE_PATH = /^\/shop\/files\/[0-9a-f]{64}\.json$/;
const HEX_COLOR = /^#[\da-f]{6}$/i;

const animationThemeOf = (
  path: string | undefined,
  colors: Record<string, string> | undefined,
): AnimationTheme | undefined => {
  if (path === undefined || !LOTTIE_PATH.test(path)) return undefined;
  return {
    url: apiAssetUrl(path),
    colorFilters: Object.entries(colors ?? {}).flatMap(([keypath, color]) =>
      keypath.length > 0 && HEX_COLOR.test(color) ? [{ keypath, color }] : [],
    ),
  };
};

export const shopAnimationOf = (view: ShopItemView): ShopAnimation | undefined => {
  if (view.render !== "lottie") return undefined;
  const light = animationThemeOf(view.animation, view.layerColors);
  if (light === undefined) return undefined;
  const dark =
    view.singleTheme === true || view.dark === undefined
      ? light
      : (animationThemeOf(view.dark.animation ?? view.animation, view.dark.layerColors) ?? light);
  return { light, dark, loop: view.loop === true };
};
