import type { TFunction } from "i18next";

import type { ArenaMap } from "@entities/arena-map";

export const mapSubtitleOf = ({ valid, botMoves }: ArenaMap, t: TFunction) => {
  if (!valid) return t("arena.mapDraft");
  return botMoves === null ? t("map.valid") : t("arena.botEstimate", { count: botMoves });
};
