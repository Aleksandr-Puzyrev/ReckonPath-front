import type { TFunction } from "i18next";

import type { CampaignLevel } from "@entities/level";

export const levelTitleOf = (t: TFunction, language: string, { level, number }: CampaignLevel) => {
  const title = language === "ru" ? level.title?.ru : level.title?.en;
  return title === undefined ? String(number) : t("levels.row", { n: number, title });
};
