import type { TFunction } from "i18next";

import type { HistoryItem } from "@entities/match";

const RESULT_KEYS = {
  win: "arena.history.resultWin",
  loss: "arena.history.resultLoss",
  draw: "arena.history.resultDraw",
} as const;

export const matchLineOf = ({ outcome, kind, moves }: HistoryItem, t: TFunction) => {
  if (kind === "map") return t("arena.history.async", { result: t(RESULT_KEYS[outcome]) });
  const line = t(`arena.history.${outcome}`, { count: moves });
  return kind === "bot" ? t("arena.history.training", { text: line }) : line;
};
