import type { TFunction } from "i18next";

import type { MatchEnd } from "@entities/match";

export const resultReasonOf = ({ result, reason, turns }: MatchEnd, t: TFunction) => {
  if (reason === "annulled") return t("result.pvp.reason.annulled");
  if (reason === "turnLimit") return t("result.pvp.reason.turnLimit");
  if (reason === "targets") {
    if (result === "draw") return t("result.pvp.reason.draw");
    return t("result.pvp.reason.targets", { count: result === "win" ? turns.me : turns.opponent });
  }
  // Part 5 words a surrender and an afk from the winner's side only (Часть 5 формулирует сдачу и уход только со стороны победителя).
  return result === "win" ? t(`result.pvp.reason.${reason}`) : null;
};
