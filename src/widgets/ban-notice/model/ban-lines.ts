import type { TFunction } from "i18next";

import type { Ban } from "@entities/app-config";
import { formatDayMonth } from "@shared/lib";

export const banLinesOf = (ban: Ban, playerId: string | null, t: TFunction, locale: string) => {
  const term =
    ban.until === null
      ? t("system.banned.permanent", { reason: ban.reason })
      : t("system.banned.body", { reason: ban.reason, date: formatDayMonth(ban.until, locale) });
  return playerId === null ? [term] : [term, t("system.banned.id", { id: playerId })];
};
