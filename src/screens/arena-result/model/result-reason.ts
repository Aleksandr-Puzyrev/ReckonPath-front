import type { TFunction } from "i18next";

import type { MatchView } from "@entities/match";

// The reasons are worded from the winner's side, as Part 5 does; the loser of a surrender sees none (причины сформулированы со стороны победителя, как в Части 5; сдавшийся причины не видит).
export const resultReasonOf = ({ result, me, rival, norm }: MatchView, t: TFunction) => {
  if (result === undefined) return null;
  const { outcome, reason } = result;
  if (reason === "norm") return t("async.reason", { count: me.moves, norm: norm ?? 0 });
  if (reason === "equal") return t("result.pvp.reason.draw");
  if (reason === "final") return t("result.pvp.reason.final");
  if (reason === "timeouts") return t("result.pvp.reason.timeouts");
  if (reason === "abandoned") return t("result.pvp.reason.abandoned");
  if (reason === "max_turns") return t("result.pvp.reason.maxTurns");
  if (reason === "cancelled") return t("result.pvp.reason.cancelled");
  if (reason === "surrender") return outcome === "win" ? t("result.pvp.reason.surrender") : null;
  return t("result.pvp.reason.targets", { count: outcome === "loss" ? rival.moves : me.moves });
};
