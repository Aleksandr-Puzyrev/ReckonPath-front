import type { TFunction } from "i18next";

import type { GameState, Idx } from "@reckon-path/engine";

import { cellLabel } from "@entities/level";

export type AnswerTone = "normal" | "hot" | "warm" | "cold" | "danger";

export interface AnswerDescription {
  title: string;
  subtitle: string;
  tone: AnswerTone;
}

const idleSubtitle = (t: TFunction, game: GameState) => {
  if (game.rules.probeMode === "direction") return t("play.panel.idleDirection");
  if (game.rules.probeMode === "hotcold") return t("play.panel.idleHotcold");
  if (game.board.beacons.length > 0) return t("play.panel.idleBeacons");
  return t("play.panel.idleDistance");
};

const COMPARE_TONE = { warmer: "hot", colder: "cold", same: "normal", none: "normal" } as const;

const describeAnswer = (t: TFunction, game: GameState, idx: Idx): AnswerDescription | null => {
  const reveal = game.revealed.get(idx);
  if (reveal === undefined) return null;
  const cell = cellLabel(game.board.cols, idx);

  if (reveal.kind === "bomb") {
    return { title: t("play.panel.bomb", { cell }), subtitle: t("play.bomb"), tone: "danger" };
  }
  if (reveal.kind === "target") {
    const left = game.board.targets.length - game.found.size;
    return {
      title: t("play.panel.target", { cell }),
      subtitle: left > 0 ? t("play.panel.targetsLeft", { count: left }) : t("play.panel.allFound"),
      tone: "warm",
    };
  }
  if (reveal.kind === "direction") {
    const dir = t(`play.dir.${reveal.dir}`);
    return {
      title: t("play.panel.direction", { cell, dir }),
      subtitle: t("play.panel.directionSub", { dir }),
      tone: "normal",
    };
  }
  if (reveal.kind === "hotcold") {
    return {
      title: t("play.panel.hotcold", { cell, cmp: t(`play.probe.${reveal.cmp}`) }),
      subtitle: t(reveal.cmp === "none" ? "play.panel.hotcoldFirst" : "play.panel.hotcoldSub"),
      tone: COMPARE_TONE[reveal.cmp],
    };
  }

  const next = game.board.targets.findIndex((target) => !game.found.has(target)) + 1;
  return {
    title: t("play.last", { cell, value: reveal.value, heat: t(`play.probe.${reveal.heat}`) }),
    subtitle: game.board.targetOrder
      ? t("play.panel.order", { n: next, count: reveal.value })
      : t("play.panel.distance", { count: reveal.value }),
    tone: reveal.heat,
  };
};

export const describeLastAnswer = (
  t: TFunction,
  game: GameState,
  lastCell: Idx | null,
): AnswerDescription => {
  const answer = lastCell === null ? null : describeAnswer(t, game, lastCell);
  if (answer === null) {
    return { title: t("play.panel.idle"), subtitle: idleSubtitle(t, game), tone: "normal" };
  }

  const reveal = lastCell === null ? undefined : game.revealed.get(lastCell);
  let subtitle = answer.subtitle;
  if (reveal !== undefined && "buoy" in reveal && reveal.buoy === true) {
    subtitle = t("play.panel.buoy", { text: subtitle });
  }
  if (reveal !== undefined && "bombNear" in reveal && reveal.bombNear) {
    subtitle = t("play.panel.bombNear", { text: subtitle });
  }
  if (game.rules.fog !== null && reveal?.kind !== "bomb") {
    subtitle = t("play.panel.fog", { text: subtitle, count: game.rules.fog });
  }
  return { ...answer, subtitle };
};
