import { useQueries } from "@tanstack/react-query";
import { useUnistyles } from "react-native-unistyles";

import { BOARD_SLOTS, skinQueryOptions, useInventoryQuery } from "@entities/item";
import { useMeQuery } from "@entities/wallet";

import { boardSkinFor } from "./board-skin";
import type { BoardTheme } from "./board-skin";

export interface BoardLook {
  packageUrl: string | null;
  theme: BoardTheme;
}

const useEquippedSkinUrls = () => {
  const { data: me } = useMeQuery();
  const { data: inventory } = useInventoryQuery();
  return BOARD_SLOTS.flatMap((slot) => {
    const id = me?.loadout[slot];
    const url = inventory?.items.find(({ itemId }) => itemId === id)?.item.package.url;
    return url === undefined || url === "" ? [] : [url];
  });
};

// Without a look the board wears the player's equipped skin in the app theme; a skin not loaded yet leaves the default (без заданного вида поле носит надетый скин в теме приложения; ещё не загруженный скин оставляет стандартный).
export const useBoardSkin = (look?: BoardLook) => {
  const { rt } = useUnistyles();
  const equippedUrls = useEquippedSkinUrls();
  const lookUrl = look?.packageUrl ?? "";
  const urls = look === undefined ? equippedUrls : [lookUrl].filter((url) => url !== "");
  const theme = look?.theme ?? (rt.themeName === "light" ? "light" : "dark");
  const skins = useQueries({ queries: urls.map(skinQueryOptions) });
  return boardSkinFor(
    theme,
    skins.flatMap(({ data }) => {
      const part = data?.[theme];
      return part === undefined ? [] : [part];
    }),
  );
};
