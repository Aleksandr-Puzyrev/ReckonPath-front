import { distanceBetween } from "../distance/distance";
import { cellCount, passableNeighbors, UNREACHABLE } from "../grid/grid";
import type {
  Board,
  Direction,
  GameState,
  Heat,
  HeatConfig,
  HotColdCompare,
  Idx,
} from "../model/types";

type ProbeContext = Pick<GameState, "board" | "dist" | "found">;

const BASIS_POINTS = 10_000;
const MIN_HOT_MAX = 2;

const nextOrderedTarget = (board: Board, found: ReadonlySet<Idx>) =>
  board.targets.find((target) => !found.has(target));

export const probeValue = ({ board, dist, found }: ProbeContext, idx: Idx) => {
  const size = cellCount(board);

  if (board.targetOrder) {
    const target = nextOrderedTarget(board, found);
    return target === undefined ? UNREACHABLE : distanceBetween(dist, size, idx, target);
  }

  return board.targets.reduce(
    (best, target) =>
      found.has(target) ? best : Math.min(best, distanceBetween(dist, size, idx, target)),
    UNREACHABLE,
  );
};

export const computeHeatD = (board: Board, dist: Int16Array) => {
  const context: ProbeContext = { board, dist, found: new Set() };

  return board.kinds.reduce(
    (max, kind, idx) => (kind === "rock" ? max : Math.max(max, probeValue(context, idx))),
    0,
  );
};

// Integer arithmetic keeps ceil() exact and identical across TS and Go (целочисленная арифметика даёт точный ceil(), одинаковый в TS и Go).
const ceilShare = (share: number, value: number) => {
  const points = Math.round(share * BASIS_POINTS);
  return Math.floor((points * value + BASIS_POINTS - 1) / BASIS_POINTS);
};

export const heatThresholds = (heatD: number, config: HeatConfig) => {
  const hotMax = Math.max(MIN_HOT_MAX, ceilShare(config.hotPct, heatD));
  const warmMax = Math.max(hotMax + 1, ceilShare(config.warmPct, heatD));

  return { hotMax, warmMax };
};

export const heatOf = (value: number, heatD: number, config: HeatConfig): Heat => {
  const { hotMax, warmMax } = heatThresholds(heatD, config);
  if (value <= hotMax) return "hot";
  if (value <= warmMax) return "warm";

  return "cold";
};

export const directionOf = (context: ProbeContext, idx: Idx): Direction => {
  let best: { dir: Direction; value: number } | null = null;

  for (const { dir, idx: neighbor } of passableNeighbors(context.board, idx)) {
    const value = probeValue(context, neighbor);
    if (best === null || value < best.value) best = { dir, value };
  }

  if (best === null) throw new Error(`Cell ${idx} has no passable neighbours`);

  return best.dir;
};

export const compareHotCold = (value: number, lastValue: number | null): HotColdCompare => {
  if (lastValue === null) return "none";
  if (value < lastValue) return "warmer";
  if (value > lastValue) return "colder";

  return "same";
};
