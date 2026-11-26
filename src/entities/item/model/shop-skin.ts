import type { components } from "@shared/api";

import type { ShopKind, ShopItemView } from "./item-type";
import { shopTextureUrl } from "./shop-texture";
import type { BoardTexture, BoardTextureUrls, SkinData, ThemeSkin } from "./skin-data";

type Palette = components["schemas"]["ShopPalette"];

const HEX_COLOR = /^#[\da-f]{6}$/i;

const stops = (palette: Palette, key: string): string[] | undefined => {
  const values = palette[key];
  return values?.length && values.every((value) => HEX_COLOR.test(value)) ? values : undefined;
};

const first = (palette: Palette, key: string) => stops(palette, key)?.[0];

const element = (key: string, value: string | string[] | undefined): ThemeSkin =>
  value === undefined ? {} : { elements: { [key]: value } };

const fieldOf = (palette: Palette): ThemeSkin => {
  const background = stops(palette, "bg");
  const cell = stops(palette, "cell");
  const number = first(palette, "number");
  const revealedTint = first(palette, "open");
  return {
    ...(background === undefined ? {} : { frame: { gradient: background } }),
    ...(cell === undefined ? {} : { cell: { stops: cell } }),
    ...(number === undefined ? {} : { number }),
    ...(revealedTint === undefined ? {} : { revealedTint }),
  };
};

const themeOf = (kind: ShopKind, palette: Palette): ThemeSkin => {
  switch (kind) {
    case "board":
      return fieldOf(palette);
    case "fence":
      return element("fence", first(palette, "bar"));
    case "stream":
      return element("stream", stops(palette, "water"));
    case "bridge":
      return element("bridge", stops(palette, "wood"));
    case "heavy":
      return element("heavy", stops(palette, "cell"));
    case "rock":
      return element("rock", stops(palette, "cell"));
    case "bomb":
      return element("mine", first(palette, "body"));
    case "beacon":
      return element("beaconTower", first(palette, "body"));
    case "marker":
      return element("target", stops(palette, "body"));
    case "buoy": {
      const top = first(palette, "body");
      const bottom = first(palette, "glow");
      return top === undefined ? {} : element("buoy", [top, bottom ?? top]);
    }
    case "number": {
      const number = first(palette, "fill");
      return number === undefined ? {} : { number };
    }
    default:
      return {};
  }
};

const TEXTURE_PARTS: Partial<Record<ShopKind, readonly BoardTexture[]>> = {
  board: ["bg", "cell", "open"],
  fence: ["fence"],
  stream: ["water"],
  bridge: ["bridge"],
  heavy: ["heavy"],
  rock: ["rock"],
  bomb: ["bomb"],
  buoy: ["buoy"],
  beacon: ["beacon"],
  marker: ["marker"],
};

const texturesOf = (kind: ShopKind, paths: ShopItemView["textures"]): BoardTextureUrls =>
  Object.fromEntries(
    (TEXTURE_PARTS[kind] ?? []).flatMap((key) => {
      const url = shopTextureUrl(paths?.[key]);
      return url === undefined ? [] : [[key, url]];
    }),
  );

const skinOf = (
  kind: ShopKind,
  style: Palette | undefined,
  paths: ShopItemView["textures"],
): ThemeSkin | undefined => {
  const textures = texturesOf(kind, paths);
  const palette = style === undefined ? {} : themeOf(kind, style);
  if (Object.keys(textures).length > 0) return { ...palette, textures };
  return Object.keys(palette).length === 0 ? undefined : palette;
};

export const shopSkinOf = ({
  kind,
  style,
  dark,
  singleTheme,
  render,
  textures,
}: ShopItemView): SkinData | undefined => {
  const light = skinOf(kind, style, render === "textures" ? textures : undefined);
  const darkSkin =
    singleTheme === true
      ? light
      : skinOf(kind, dark?.style, render === "textures" ? dark?.textures : undefined);
  if (light === undefined && darkSkin === undefined) return undefined;
  return { light, dark: darkSkin };
};
