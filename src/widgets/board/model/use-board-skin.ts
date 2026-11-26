import { useQueries } from "@tanstack/react-query";
import { useUnistyles } from "react-native-unistyles";

import { BOARD_SLOTS, skinQueryOptions, useInventoryQuery } from "@entities/item";
import type { SkinData } from "@entities/item";

import { boardSkinFor } from "./board-skin";
import type { BoardTheme } from "./board-skin";

export interface BoardLook {
  packageUrl: string | null;
  theme: BoardTheme;
  skin?: SkinData;
}

const useEquippedSkins = () => {
  const { data: inventory } = useInventoryQuery();
  return BOARD_SLOTS.flatMap((slot) => {
    const id = inventory?.loadout[slot];
    const entry = inventory?.items.find(({ itemId }) => itemId === id);
    return entry === undefined ? [] : [entry.item];
  });
};

export const useBoardSkin = (look?: BoardLook) => {
  const { rt } = useUnistyles();
  const equipped = useEquippedSkins();
  const sources =
    look === undefined ? equipped : [{ skinUrl: look.packageUrl ?? "", skin: look.skin }];
  const theme = look?.theme ?? (rt.themeName === "light" ? "light" : "dark");
  const urls = sources.flatMap(({ skinUrl }) => (skinUrl === "" ? [] : [skinUrl]));
  const skins = useQueries({ queries: urls.map(skinQueryOptions) });
  const packages = new Map(urls.map((url, index) => [url, skins[index]?.data]));

  return boardSkinFor(
    theme,
    sources.flatMap(({ skin, skinUrl }) => {
      const part = skin?.[theme] ?? packages.get(skinUrl)?.[theme];
      return part === undefined ? [] : [part];
    }),
  );
};
