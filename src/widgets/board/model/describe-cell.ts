import type { TFunction } from "i18next";

import { isStale } from "@reckon-path/engine";
import type { GameState, Idx } from "@reckon-path/engine";

import { cellLabel } from "@entities/level";

export const describeRevealedCell = (t: TFunction, game: GameState, idx: Idx) => {
  const reveal = game.revealed.get(idx);
  if (reveal === undefined) return null;
  const cell = cellLabel(game.board.cols, idx);

  if (reveal.kind === "bomb") return t("play.tooltip.bomb", { cell });
  const base = (() => {
    if (reveal.kind === "target") return t("play.tooltip.target", { cell });
    if (reveal.kind === "direction") {
      return t("play.tooltip.direction", { cell, dir: t(`play.dir.${reveal.dir}`) });
    }
    if (reveal.kind === "hotcold") {
      return t("play.tooltip.hotcold", { cell, cmp: t(`play.probe.${reveal.cmp}`) });
    }
    const text = t("play.tooltip.distance", { cell, value: reveal.value });
    return isStale(game, reveal) ? t("play.tooltip.stale", { text }) : text;
  })();
  return reveal.bombNear ? t("play.tooltip.bombNear", { text: base }) : base;
};

const KIND_KEYS = {
  stream: "play.cell.stream",
  heavy: "play.cell.heavy",
  rock: "play.cell.rock",
} as const;

export const cellAccessibilityLabel = (
  t: TFunction,
  game: GameState,
  idx: Idx,
  hasFlag: boolean,
) => {
  const parts = [t("play.cell.label", { cell: cellLabel(game.board.cols, idx) })];
  const kind = game.board.kinds[idx];
  if (game.board.bridges.has(idx)) parts.push(t("play.cell.bridge"));
  else if (kind !== undefined && kind !== "open") parts.push(t(KIND_KEYS[kind]));

  const description = describeRevealedCell(t, game, idx);
  if (description === null) parts.push(t(hasFlag ? "play.cell.flag" : "play.cell.closed"));
  else parts.push(description);
  return parts.join(", ");
};
