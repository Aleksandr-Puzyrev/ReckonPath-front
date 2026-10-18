import type { TFunction } from "i18next";

import type { ArenaMap } from "@entities/arena-map";

export const mapSubtitleOf = ({ valid, botNorm }: ArenaMap, t: TFunction) =>
  valid && botNorm !== null ? t("arena.botEstimate", { count: botNorm }) : t("arena.mapDraft");
