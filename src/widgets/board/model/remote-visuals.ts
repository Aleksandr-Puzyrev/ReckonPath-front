import { DEFAULT_ENGINE_CONFIG, heatOf, initGame } from "@reckon-path/engine";
import type { Board, Idx, LevelRules } from "@reckon-path/engine";

import type { CellContent, CellVisual } from "./cell-visuals";

export interface RemoteTap {
  cell: Idx;
  outcome: "pelang" | "target" | "bomb";
  value: number | null;
  bombNear: boolean;
}

interface RemoteOptions {
  flags: readonly Idx[];
  pendingCell: Idx | null;
  isDimmed: boolean;
}

// The answers come from the server: the client knows the layout but not the targets and bombs (ответы приходят с сервера: клиент знает раскладку, но не цели и бомбы).
export const remoteVisualsOf = (
  board: Board,
  rules: LevelRules,
  taps: readonly RemoteTap[],
  { flags, pendingCell, isDimmed }: RemoteOptions,
): CellVisual[] => {
  const { heatD } = initGame(board, rules, { variant: "pvp" });
  const lastTarget = taps.findLastIndex(({ outcome }) => outcome === "target");
  const byCell = new Map(taps.map((tap, order) => [tap.cell, { tap, order }]));
  const lastCell = taps.at(-1)?.cell ?? null;

  const contentOf = ({ outcome, value }: RemoteTap): CellContent => {
    if (outcome === "bomb") return { type: "bomb" };
    if (outcome === "target") return { type: "target", order: null };
    const distance = value ?? 0;
    return {
      type: "distance",
      value: distance,
      heat: heatOf(distance, heatD, DEFAULT_ENGINE_CONFIG.heat),
    };
  };

  return board.kinds.map((_, idx) => {
    const entry = byCell.get(idx);
    const emphasis = idx === pendingCell ? "highlight" : isDimmed ? "dim" : "none";
    return {
      content:
        entry === undefined
          ? { type: "hidden", hasFlag: flags.includes(idx), ghost: null }
          : contentOf(entry.tap),
      emphasis,
      isStale: entry !== undefined && entry.tap.outcome === "pelang" && entry.order < lastTarget,
      isFogged: false,
      isLast: idx === lastCell,
      hasBombNear: entry?.tap.bombNear ?? false,
      isBeacon: false,
      isBuoy: false,
    };
  });
};
