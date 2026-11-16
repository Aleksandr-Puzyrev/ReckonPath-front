import type { TFunction } from "i18next";

import type { MatchView } from "@entities/match";

export const bannerTextOf = ({ kind, norm, final, turn, me }: MatchView, t: TFunction) => {
  if (kind === "map") return t("async.reason", { count: me.moves, norm: norm ?? 0 });
  if (final === true) return t(turn === "me" ? "match.finalTurn" : "match.theirFinal");
  if (turn === "me") return t("match.yourTurn");
  return me.skips > 0 ? t("match.youSkip") : t("match.theirTurn");
};
