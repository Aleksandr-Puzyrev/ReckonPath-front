import type { TFunction } from "i18next";

import { formatTrophyDelta } from "./format-trophy-delta";

interface TrophyChange {
  friendly?: boolean;
  trophies: number;
}

export const trophyTextOf = ({ friendly, trophies }: TrophyChange, t: TFunction) =>
  friendly === true ? t("arena.history.friendly") : formatTrophyDelta(trophies);
