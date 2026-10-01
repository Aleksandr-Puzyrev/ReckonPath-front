import { PVP_SOLVER_BOMB_PENALTY } from "../config/engine-config";
import { allPairs, distanceBetween } from "../distance/distance";
import { drawFreeCells, drawRandomCell, FREE_CELL_DRAWS } from "../grid/draw-free-cells";
import { cellKey, toIdx } from "../grid/grid";
import { createBoard } from "../level/create-board";
import type { LevelInput } from "../level/level-schema";
import type { Fence, Point } from "../model/types";
import { randInt } from "../random/random";
import type { Rng } from "../random/random";
import { computeNorm, validateLevelNorm } from "../solver/norm";
import type { Norm } from "../solver/norm";
import type { PvpElement, PvpFormat, ValidationContext } from "../validator/validate-level";
import { validateLevel } from "../validator/validate-level";

const ATTEMPTS = 30;
const ELEMENT_SHARE_TENTHS = 7;
const HORIZONTAL_FENCE_CHANCE = 0.5;
const MIN_TARGET_DISTANCE = 2;
const NORM_RANGE = [0.8, 1.3] as const;

interface RandomMapOptions {
  format: PvpFormat;
  rng: Rng;
  medianNorm: number;
  levelId: string;
}

export interface RandomPvpMap {
  level: LevelInput;
  norm: Norm;
}

const elementCount = (rng: Rng, format: PvpFormat, element: PvpElement) =>
  randInt(rng, 0, Math.floor((ELEMENT_SHARE_TENTHS * (format.limits[element] ?? 0)) / 10));

const drawFences = (rng: Rng, size: number, count: number) => {
  const fences: Fence[] = [];
  const edges = new Set<string>();
  for (let draw = 0; draw < FREE_CELL_DRAWS && fences.length < count; draw += 1) {
    const [row, col] = drawRandomCell(rng, size);
    const isHorizontal = rng() < HORIZONTAL_FENCE_CHANCE;
    const next: Point = isHorizontal ? [row, col + 1] : [row + 1, col];
    const edge = `${cellKey([row, col])}|${cellKey(next)}`;
    if (next[0] >= size || next[1] >= size || edges.has(edge)) continue;
    edges.add(edge);
    fences.push([[row, col], next]);
  }
  return fences;
};

const buildAttempt = ({ format, rng, levelId }: RandomMapOptions): LevelInput => {
  const size = format.size;
  const fences = drawFences(rng, size, elementCount(rng, format, "fences"));
  const streams = drawFreeCells(rng, size, elementCount(rng, format, "streams"), () => true);
  const streamKeys = new Set(streams.map(cellKey));
  const heavy = drawFreeCells(
    rng,
    size,
    elementCount(rng, format, "heavy"),
    (cell) => !streamKeys.has(cellKey(cell)),
  );
  const taken = new Set([...streamKeys, ...heavy.map(cellKey)]);
  const rocks = drawFreeCells(
    rng,
    size,
    elementCount(rng, format, "rocks"),
    (cell) => !taken.has(cellKey(cell)),
  );
  const rockKeys = new Set(rocks.map(cellKey));
  const bridges = drawFreeCells(rng, size, elementCount(rng, format, "bridges"), (cell) =>
    streamKeys.has(cellKey(cell)),
  );

  const terrain: LevelInput = {
    v: 2,
    id: levelId,
    rows: size,
    cols: size,
    targets: [[0, 0]],
    fences,
    streams,
    heavy,
    rocks,
    bridges,
    probeMode: "distance",
  };
  const { board } = createBoard(terrain);
  const dist = allPairs(board);
  const cells = size * size;
  const isFarEnough = (a: Point, b: Point) => {
    const [from, to] = [toIdx(size, a), toIdx(size, b)];
    return (
      distanceBetween(dist, cells, from, to) >= MIN_TARGET_DISTANCE &&
      distanceBetween(dist, cells, to, from) >= MIN_TARGET_DISTANCE
    );
  };

  const targets: Point[] = [];
  for (let draw = 0; draw < FREE_CELL_DRAWS && targets.length < format.targets; draw += 1) {
    const cell = drawRandomCell(rng, size);
    if (rockKeys.has(cellKey(cell)) || targets.some((target) => !isFarEnough(target, cell)))
      continue;
    targets.push(cell);
  }
  const targetKeys = new Set(targets.map(cellKey));
  const bombs = drawFreeCells(
    rng,
    size,
    elementCount(rng, format, "bombs"),
    (cell) => !rockKeys.has(cellKey(cell)) && !targetKeys.has(cellKey(cell)),
  );

  return { ...terrain, targets, bombs };
};

const isNearMedian = (norm: Norm, medianNorm: number) => {
  const [low, high] = NORM_RANGE;
  return norm.norm >= low * medianNorm && norm.norm <= high * medianNorm;
};

export const generateRandomPvpMap = (options: RandomMapOptions): RandomPvpMap | null => {
  const context: ValidationContext = { kind: "pvp", format: options.format };
  const distanceToMedian = ({ norm }: Norm) => Math.abs(norm - options.medianNorm);
  let best: RandomPvpMap | null = null;

  for (let attempt = 0; attempt < ATTEMPTS; attempt += 1) {
    const level = buildAttempt(options);
    if (validateLevel(level, context).length > 0) continue;

    const { board, rules } = createBoard(level);
    const norm = computeNorm(board, rules, level.id, PVP_SOLVER_BOMB_PENALTY);
    if (validateLevelNorm(level, context, norm).length > 0) continue;

    const candidate = { level, norm };
    if (isNearMedian(norm, options.medianNorm)) return candidate;
    if (best === null || distanceToMedian(norm) < distanceToMedian(best.norm)) best = candidate;
  }

  return best;
};
