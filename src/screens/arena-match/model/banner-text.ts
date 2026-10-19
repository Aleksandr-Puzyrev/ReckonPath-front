import type { TFunction } from "i18next";

import type { MatchPhase, Side, TurnSkip } from "@entities/match";

const hasBombSkip = (skipped: readonly TurnSkip[], player: Side) =>
  skipped.some((skip) => skip.player === player && skip.reason === "bomb");

export const bannerTextOf = (
  phase: MatchPhase,
  current: Side | null,
  skipped: readonly TurnSkip[],
  t: TFunction,
) => {
  if (phase === "intro") return t("vs.coin");
  if (phase === "ended") return t("match.over");
  if (phase === "finalTurn") return current === "me" ? t("match.finalTurn") : t("match.theirFinal");
  if (current === "me")
    return hasBombSkip(skipped, "opponent") ? t("match.theySkip") : t("match.yourTurn");
  return hasBombSkip(skipped, "me") ? t("match.youSkip") : t("match.theirTurn");
};
