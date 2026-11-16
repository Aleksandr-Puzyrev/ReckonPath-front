import type { TFunction } from "i18next";

import type { CampaignLevel } from "@entities/level";

export const levelTitleOf = (
  t: TFunction,
  { number, title }: Pick<CampaignLevel, "number" | "title">,
) => (title === "" ? String(number) : t("levels.row", { n: number, title }));
