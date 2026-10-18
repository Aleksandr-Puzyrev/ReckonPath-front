import type { TFunction } from "i18next";

import type { MatchSummary } from "@entities/match";

const RESULT_KEYS = {
  win: "arena.history.resultWin",
  loss: "arena.history.resultLoss",
  draw: "arena.history.resultDraw",
} as const;

export const matchLineOf = ({ result, mode, turns }: MatchSummary, t: TFunction) => {
  if (result === "annulled") return t("arena.history.annulled");
  if (mode === "async") return t("arena.history.async", { result: t(RESULT_KEYS[result]) });
  const line = t(`arena.history.${result}`, { count: turns.me });
  return mode === "bot" ? t("arena.history.training", { text: line }) : line;
};
