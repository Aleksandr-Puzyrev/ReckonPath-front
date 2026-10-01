import {
  FOG_MAX,
  FOG_MIN,
  MAX_BEACONS,
  MAX_BOMBS,
  MAX_BUOYS,
  MAX_ROCK_SHARE,
  MAX_TARGETS,
  MIN_BOARD_SIZE,
  MAX_BOARD_SIZE,
  MIN_TARGETS,
  PASSABLE_CELLS_PER_BOMB,
} from "../config/engine-config";
import { cellKey, edgeKey, gridNeighbors, isInside, toCell, toIdx } from "../grid/grid";
import type { LevelInput } from "../level/level-schema";
import { normalizeLevel } from "../level/normalize-level";
import type { NormalizedLevel } from "../level/normalize-level";
import type { Cell } from "../model/types";

export type PvpElement = "fences" | "streams" | "heavy" | "rocks" | "bridges" | "bombs";

export interface PvpFormat {
  size: number;
  targets: number;
  limits: Partial<Record<PvpElement, number>>;
}

export type ValidationContext =
  | { kind: "campaign" }
  | { kind: "custom" }
  | { kind: "daily" }
  | { kind: "pvp"; format: PvpFormat };

export type ValidationError =
  | { code: "SIZE" }
  | { code: "OUT_OF_BOUNDS"; cells: Cell[] }
  | { code: "DUPLICATE"; cells: Cell[] }
  | { code: "FENCE_NOT_ADJACENT"; edge: [Cell, Cell] }
  | { code: "NOT_CONNECTED"; cells: Cell[] }
  | { code: "TARGET_COUNT"; expected: number | { min: number; max: number }; actual: number }
  | { code: "TARGET_ON_ROCK"; cells: Cell[] }
  | { code: "BOMB_ON_ROCK"; cells: Cell[] }
  | { code: "BOMB_ON_TARGET"; cells: Cell[] }
  | { code: "BRIDGE_NOT_ON_STREAM"; cells: Cell[] }
  | { code: "TOO_MANY_BOMBS"; max: number }
  | { code: "TOO_MANY_ROCKS"; max: number }
  | { code: "ELEMENT_LIMIT"; element: PvpElement; max: number }
  | { code: "BEACON_ON_HIDDEN"; cells: Cell[] }
  | { code: "BEACON_ON_ROCK"; cells: Cell[] }
  | { code: "BEACON_LIMIT"; max: number }
  | { code: "BUOY_OVERLAP"; cells: Cell[] }
  | { code: "BUOY_LIMIT"; max: number }
  | { code: "FOG_RANGE"; min: number; max: number }
  | { code: "ORDER_SINGLE_TARGET" }
  | { code: "FEATURE_IN_PVP"; features: string[] };

export type ValidationCode = ValidationError["code"];

type Check = (level: NormalizedLevel, context: ValidationContext) => ValidationError[];

const intersect = (cells: readonly Cell[], others: readonly Cell[]) => {
  const otherKeys = new Set(others.map(cellKey));
  return cells.filter((cell) => otherKeys.has(cellKey(cell)));
};

const cellsError = <C extends ValidationError["code"]>(code: C, cells: Cell[]) =>
  cells.length > 0 ? [{ code, cells }] : [];

const areAdjacent = ([r1, c1]: Cell, [r2, c2]: Cell) => Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1;

const collectCells = (level: NormalizedLevel): Cell[] => [
  ...level.targets,
  ...level.bombs,
  ...level.streams,
  ...level.bridges,
  ...level.heavy,
  ...level.rocks,
  ...level.beacons,
  ...level.buoys,
  ...level.fences.flat(),
];

const findDuplicates = (level: NormalizedLevel): Cell[] => {
  const duplicates = new Map<string, Cell>();
  const collect = (cells: readonly Cell[]) => {
    const seen = new Set<string>();
    cells.forEach((cell) => {
      if (seen.has(cellKey(cell))) duplicates.set(cellKey(cell), cell);
      seen.add(cellKey(cell));
    });
  };

  [level.targets, level.bombs, level.bridges, level.beacons, level.buoys].forEach(collect);
  // One type per cell: streams, heavy, and rocks must not overlap (один тип на клетку: ручей, ×2 и скала не пересекаются).
  collect([...level.streams, ...level.heavy, ...level.rocks]);

  const seenEdges = new Set<string>();
  level.fences.forEach(([a, b]) => {
    const edge = [cellKey(a), cellKey(b)].sort().join("|");
    if (seenEdges.has(edge)) {
      duplicates.set(cellKey(a), a);
      duplicates.set(cellKey(b), b);
    }
    seenEdges.add(edge);
  });

  return [...duplicates.values()];
};

const findDisconnected = (level: NormalizedLevel): Cell[] => {
  const { rows, cols } = level;
  const rocks = new Set(level.rocks.filter((cell) => isInside(rows, cols, cell)).map(cellKey));
  const fences = new Set(
    level.fences
      .filter(([a, b]) => isInside(rows, cols, a) && isInside(rows, cols, b))
      .map(([a, b]) => edgeKey(toIdx(cols, a), toIdx(cols, b))),
  );
  const isRock = (idx: number) => rocks.has(cellKey(toCell(cols, idx)));
  const passable = Array.from({ length: rows * cols }, (_, idx) => idx).filter(
    (idx) => !isRock(idx),
  );

  const componentOf = new Map<number, number>();
  const sizes: number[] = [];
  passable.forEach((start) => {
    if (componentOf.has(start)) return;
    const component = sizes.length;
    const queue = [start];
    componentOf.set(start, component);
    for (let head = 0; head < queue.length; head += 1) {
      const current = queue[head] ?? start;
      gridNeighbors({ rows, cols }, current).forEach(({ idx }) => {
        if (componentOf.has(idx) || isRock(idx) || fences.has(edgeKey(current, idx))) return;
        componentOf.set(idx, component);
        queue.push(idx);
      });
    }
    sizes.push(queue.length);
  });

  // The largest area is the playing field; everything else is cut off (самая большая область — поле, остальное отрезано).
  const main = sizes.indexOf(Math.max(...sizes));
  return passable.filter((idx) => componentOf.get(idx) !== main).map((idx) => toCell(cols, idx));
};

const checkSize: Check = ({ rows, cols }, context) => {
  const isInRange = [rows, cols].every((size) => size >= MIN_BOARD_SIZE && size <= MAX_BOARD_SIZE);
  const matchesFormat =
    context.kind !== "pvp" || (rows === context.format.size && cols === context.format.size);
  return isInRange && matchesFormat ? [] : [{ code: "SIZE" }];
};

const checkGeometry: Check = (level) => [
  ...cellsError(
    "OUT_OF_BOUNDS",
    collectCells(level).filter((cell) => !isInside(level.rows, level.cols, cell)),
  ),
  ...cellsError("DUPLICATE", findDuplicates(level)),
  ...level.fences
    .filter(([a, b]) => !areAdjacent(a, b))
    .map((edge): ValidationError => ({ code: "FENCE_NOT_ADJACENT", edge })),
  ...cellsError("NOT_CONNECTED", findDisconnected(level)),
];

const checkTargetCount: Check = ({ targets }, context) => {
  if (context.kind === "pvp") {
    const expected = context.format.targets;
    return targets.length === expected
      ? []
      : [{ code: "TARGET_COUNT", expected, actual: targets.length }];
  }
  return targets.length >= MIN_TARGETS && targets.length <= MAX_TARGETS
    ? []
    : [
        {
          code: "TARGET_COUNT",
          expected: { min: MIN_TARGETS, max: MAX_TARGETS },
          actual: targets.length,
        },
      ];
};

const checkPlacement: Check = ({ targets, bombs, rocks, streams, bridges }) => {
  const streamKeys = new Set(streams.map(cellKey));
  return [
    ...cellsError("TARGET_ON_ROCK", intersect(targets, rocks)),
    ...cellsError("BOMB_ON_ROCK", intersect(bombs, rocks)),
    ...cellsError("BOMB_ON_TARGET", intersect(bombs, targets)),
    ...cellsError(
      "BRIDGE_NOT_ON_STREAM",
      bridges.filter((cell) => !streamKeys.has(cellKey(cell))),
    ),
  ];
};

const checkCounts: Check = ({ rows, cols, bombs, rocks }, context) => {
  const formulaBombLimit = Math.min(
    MAX_BOMBS,
    Math.floor((rows * cols - rocks.length) / PASSABLE_CELLS_PER_BOMB),
  );
  const formatBombLimit = context.kind === "pvp" ? context.format.limits.bombs : undefined;
  const bombLimit = Math.min(formulaBombLimit, formatBombLimit ?? formulaBombLimit);
  const rockLimit = Math.floor(rows * cols * MAX_ROCK_SHARE);
  return [
    ...(bombs.length > bombLimit ? [{ code: "TOO_MANY_BOMBS", max: bombLimit } as const] : []),
    ...(rocks.length > rockLimit ? [{ code: "TOO_MANY_ROCKS", max: rockLimit } as const] : []),
  ];
};

const checkPvp: Check = (level, context) => {
  if (context.kind !== "pvp") return [];

  const counts = [
    ["fences", level.fences.length],
    ["streams", level.streams.length],
    ["heavy", level.heavy.length],
    ["rocks", level.rocks.length],
    ["bridges", level.bridges.length],
  ] as const satisfies readonly (readonly [PvpElement, number])[];
  const limits = counts.flatMap(([element, count]): ValidationError[] => {
    const max = context.format.limits[element];
    return max !== undefined && count > max ? [{ code: "ELEMENT_LIMIT", element, max }] : [];
  });

  const usedFeatures = [
    ["beacons", level.beacons.length > 0],
    ["buoys", level.buoys.length > 0],
    ["targetOrder", level.targetOrder],
    ["fog", level.fog !== null],
  ] as const;
  const features = usedFeatures.filter(([, isUsed]) => isUsed).map(([feature]) => feature);
  return [
    ...limits,
    ...(features.length > 0 ? [{ code: "FEATURE_IN_PVP", features } as const] : []),
  ];
};

const checkFeatures: Check = ({ targets, bombs, rocks, beacons, buoys, fog, targetOrder }) => {
  const errors: ValidationError[] = [
    ...cellsError("BEACON_ON_HIDDEN", intersect(beacons, [...targets, ...bombs, ...buoys])),
    ...cellsError("BEACON_ON_ROCK", intersect(beacons, rocks)),
  ];
  if (beacons.length > MAX_BEACONS) errors.push({ code: "BEACON_LIMIT", max: MAX_BEACONS });
  errors.push(...cellsError("BUOY_OVERLAP", intersect(buoys, [...targets, ...bombs, ...rocks])));
  if (buoys.length > MAX_BUOYS) errors.push({ code: "BUOY_LIMIT", max: MAX_BUOYS });
  if (fog !== null && (fog < FOG_MIN || fog > FOG_MAX)) {
    errors.push({ code: "FOG_RANGE", min: FOG_MIN, max: FOG_MAX });
  }
  if (targetOrder && targets.length === 1) errors.push({ code: "ORDER_SINGLE_TARGET" });
  return errors;
};

const CHECKS: readonly Check[] = [
  checkSize,
  checkGeometry,
  checkTargetCount,
  checkPlacement,
  checkCounts,
  checkPvp,
  checkFeatures,
];

export const validateLevel = (level: LevelInput, context: ValidationContext): ValidationError[] => {
  const normalized = normalizeLevel(level);
  return CHECKS.flatMap((check) => check(normalized, context));
};
