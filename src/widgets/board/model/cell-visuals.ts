import { isStale } from "@reckon-path/engine";
import type { Direction, GameState, Heat, HotColdCompare, Idx, Reveal } from "@reckon-path/engine";

export type CellContent =
  | { type: "hidden"; hasFlag: boolean; ghost: "target" | "bomb" | null }
  | { type: "distance"; value: number; heat: Heat }
  | { type: "direction"; dir: Direction }
  | { type: "hotcold"; cmp: HotColdCompare }
  | { type: "target"; order: number | null }
  | { type: "bomb" };

export type CellEmphasis = "none" | "dim" | "highlight";

export interface CellVisual {
  content: CellContent;
  emphasis: CellEmphasis;
  isStale: boolean;
  isFogged: boolean;
  isLast: boolean;
  hasBombNear: boolean;
  isBeacon: boolean;
  isBuoy: boolean;
}

interface VisualOptions {
  flags: readonly Idx[];
  lastCell: Idx | null;
  showHidden: boolean;
  highlight?: readonly Idx[] | null;
}

const isProbe = (reveal: Reveal) =>
  reveal.kind === "distance" || reveal.kind === "direction" || reveal.kind === "hotcold";

const contentOf = (reveal: Reveal): CellContent => {
  if (reveal.kind === "distance")
    return { type: "distance", value: reveal.value, heat: reveal.heat };
  if (reveal.kind === "direction") return { type: "direction", dir: reveal.dir };
  if (reveal.kind === "hotcold") return { type: "hotcold", cmp: reveal.cmp };
  if (reveal.kind === "target") return { type: "target", order: reveal.order ?? null };
  return { type: "bomb" };
};

// Fog keeps the last N probe answers in tap order; beacons are never fogged (туман оставляет последние N ответов в порядке тапов; маяки не скрываются).
const visibleUnderFog = (game: GameState) => {
  const fog = game.rules.fog;
  if (fog === null) return null;
  const probes = [...game.revealed.entries()]
    .filter(([, reveal]) => isProbe(reveal) && !("beacon" in reveal))
    .map(([idx]) => idx);
  return new Set(probes.slice(-fog));
};

const ghostOf = (game: GameState, idx: Idx) => {
  if (game.board.targets.includes(idx)) return "target";
  if (game.board.bombs.includes(idx)) return "bomb";
  return null;
};

const hiddenContent = (game: GameState, idx: Idx, options: VisualOptions): CellContent => ({
  type: "hidden",
  hasFlag: options.flags.includes(idx),
  ghost: options.showHidden ? ghostOf(game, idx) : null,
});

const emphasisOf = (idx: Idx, highlight: readonly Idx[] | null | undefined): CellEmphasis => {
  if (highlight == null) return "none";
  return highlight.includes(idx) ? "highlight" : "dim";
};

export const buildCellVisuals = (game: GameState, options: VisualOptions): CellVisual[] => {
  const visible = visibleUnderFog(game);

  return game.board.kinds.map((_, idx) => {
    const reveal = game.revealed.get(idx);
    const emphasis = emphasisOf(idx, options.highlight);
    if (reveal === undefined) {
      return {
        content: hiddenContent(game, idx, options),
        emphasis,
        isStale: false,
        isFogged: false,
        isLast: false,
        hasBombNear: false,
        isBeacon: false,
        isBuoy: false,
      };
    }

    const isBeacon = "beacon" in reveal && reveal.beacon === true;
    return {
      content: contentOf(reveal),
      emphasis,
      isStale: isStale(game, reveal),
      isFogged: visible !== null && isProbe(reveal) && !isBeacon && !visible.has(idx),
      isLast: idx === options.lastCell,
      hasBombNear: "bombNear" in reveal && reveal.bombNear,
      isBeacon,
      isBuoy: "buoy" in reveal && reveal.buoy === true,
    };
  });
};
