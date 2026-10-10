import type { ThemeSkin } from "@entities/item";

import skin from "./default-skin.json";

export type BoardTheme = "light" | "dark";
export type BoardSkin = (typeof skin)["dark"] & { elements: (typeof skin)["elements"] };
type SkinElements = BoardSkin["elements"];

const isSameShape = (base: unknown, value: string | string[]) =>
  Array.isArray(base)
    ? Array.isArray(value) && value.length === base.length
    : typeof base === "string" && typeof value === "string";

// Only known element colours of the same shape are taken, so a wrong skin cannot break drawing; the cast follows the `in` check (берутся только известные цвета элементов той же формы, чтобы неверный скин не сломал отрисовку; приведение идёт после проверки `in`).
const mergeElements = (base: SkinElements, overrides: ThemeSkin["elements"]): SkinElements =>
  Object.entries(overrides ?? {}).reduce<SkinElements>(
    (elements, [key, value]) =>
      key in elements && isSameShape(elements[key as keyof SkinElements], value)
        ? { ...elements, [key]: value }
        : elements,
    base,
  );

const applySkin = (base: BoardSkin, part: ThemeSkin): BoardSkin => ({
  ...base,
  frame: part.frame?.gradient ?? base.frame,
  cell: part.cell?.stops ?? base.cell,
  number: part.number ?? base.number,
  elements: mergeElements(base.elements, part.elements),
});

export const boardSkinFor = (theme: BoardTheme, parts: readonly ThemeSkin[] = []): BoardSkin =>
  parts.reduce(applySkin, { ...skin[theme], elements: skin.elements });
