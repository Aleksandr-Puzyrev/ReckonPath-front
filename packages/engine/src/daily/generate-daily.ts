import { MAX_BOARD_SIZE, MAX_TARGETS } from "../config/engine-config";
import { drawFreeCells, drawRandomCell } from "../grid/draw-free-cells";
import { cellKey } from "../grid/grid";
import { createBoard } from "../level/create-board";
import type { LevelInput } from "../level/level-schema";
import type { Fence, Point, ProbeMode } from "../model/types";
import { pick, randInt, rngFromKey } from "../random/random";
import type { Rng } from "../random/random";
import { ceilNorm, ceilNormPercent, computeNorm } from "../solver/norm";
import type { Norm } from "../solver/norm";
import { validateLevel } from "../validator/validate-level";

import { colGapWall, rowGapWall, streamColumn, streamRow, zigzagWalls } from "./line-helpers";

export const DEFAULT_DAILY_EPOCH = "2026-10-01";
const MAX_TIER = 20;
const ATTEMPTS = 50;
const DAY_MS = 86_400_000;
const DAYS_PER_TIER = 7;
const SUNDAY = 0;
const SATURDAY = 6;
const MOVE_LIMIT_TENTHS = 13;
const THREE_STARS_PERCENT = 100;
const TWO_STARS_PERCENT = 115;
const FALLBACK_SIZE = 5;

type Range = readonly [min: number, max: number];

interface TierRow {
  fromTier: number;
  size: Range;
  targets: Range;
  fenceLines: Range;
  streamLines: Range;
  heavy: Range;
  rocks: Range;
  bridges: Range;
  bombs: Range;
  modes: readonly ProbeMode[];
}

const ANY_MODE: readonly ProbeMode[] = ["distance", "direction", "hotcold"];

const TIERS: readonly TierRow[] = [
  {
    fromTier: 1,
    size: [5, 5],
    targets: [1, 1],
    fenceLines: [0, 0],
    streamLines: [0, 0],
    heavy: [0, 0],
    rocks: [0, 0],
    bridges: [0, 0],
    bombs: [0, 0],
    modes: ["distance"],
  },
  {
    fromTier: 3,
    size: [6, 6],
    targets: [1, 1],
    fenceLines: [1, 1],
    streamLines: [0, 1],
    heavy: [0, 0],
    rocks: [0, 0],
    bridges: [0, 0],
    bombs: [0, 0],
    modes: ["distance"],
  },
  {
    fromTier: 5,
    size: [6, 7],
    targets: [1, 2],
    fenceLines: [1, 1],
    streamLines: [1, 1],
    heavy: [0, 1],
    rocks: [0, 0],
    bridges: [0, 0],
    bombs: [1, 1],
    modes: ["distance"],
  },
  {
    fromTier: 8,
    size: [7, 7],
    targets: [2, 2],
    fenceLines: [1, 2],
    streamLines: [1, 1],
    heavy: [1, 2],
    rocks: [1, 3],
    bridges: [0, 0],
    bombs: [1, 2],
    modes: ["distance", "direction"],
  },
  {
    fromTier: 11,
    size: [7, 8],
    targets: [2, 2],
    fenceLines: [2, 2],
    streamLines: [1, 2],
    heavy: [1, 2],
    rocks: [2, 4],
    bridges: [1, 1],
    bombs: [2, 2],
    modes: ANY_MODE,
  },
  {
    fromTier: 15,
    size: [8, 9],
    targets: [2, 3],
    fenceLines: [2, 2],
    streamLines: [2, 2],
    heavy: [2, 3],
    rocks: [3, 6],
    bridges: [1, 2],
    bombs: [2, 3],
    modes: ANY_MODE,
  },
];

const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;

const utcTime = (dateKey: string) => {
  if (!DATE_KEY.test(dateKey)) throw new RangeError(`Invalid date key ${dateKey}`);
  const time = Date.parse(`${dateKey}T00:00:00Z`);
  // Rejects calendar overflow such as 2026-02-30, which some engines roll over to March (отклоняет даты вроде 2026-02-30, которые часть движков переносит на март).
  const isExact = !Number.isNaN(time) && new Date(time).toISOString().slice(0, 10) === dateKey;
  if (!isExact) throw new RangeError(`Invalid date key ${dateKey}`);
  return time;
};

export const dailyTier = (dateKey: string, epochKey = DEFAULT_DAILY_EPOCH) => {
  const days = Math.max(0, Math.round((utcTime(dateKey) - utcTime(epochKey)) / DAY_MS));
  return Math.min(MAX_TIER, 1 + Math.floor(days / DAYS_PER_TIER));
};

export const isWeekend = (dateKey: string) => {
  const day = new Date(utcTime(dateKey)).getUTCDay();
  return day === SUNDAY || day === SATURDAY;
};

const tierRow = (tier: number) => {
  const row = [...TIERS].reverse().find(({ fromTier }) => tier >= fromTier);
  if (row === undefined) throw new Error(`No tier row for tier ${tier}`);
  return row;
};

const drawRange = (rng: Rng, [min, max]: Range) => randInt(rng, min, max);

const drawFences = (rng: Rng, size: number, lines: number): Fence[] => {
  if (lines === 0) return [];
  if (lines === 1) {
    const kind = pick(rng, ["col", "row", "zigzag"] as const);
    if (kind === "col")
      return colGapWall(size, randInt(rng, 1, size - 2), randInt(rng, 0, size - 1));
    if (kind === "row")
      return rowGapWall(size, randInt(rng, 1, size - 2), randInt(rng, 0, size - 1));
    const colA = randInt(rng, 1, Math.max(1, Math.floor(size / 2) - 1));
    const colB = randInt(rng, Math.min(size - 2, colA + 1), size - 2);
    return zigzagWalls(size, colA, colB, randInt(rng, 1, size - 1));
  }

  const kind = pick(rng, ["doubleCol", "doubleRow"] as const);
  const first = randInt(rng, 1, Math.max(1, Math.floor(size / 2) - 1));
  const second = randInt(rng, Math.min(size - 2, first + 2), size - 2);
  const wall = kind === "doubleCol" ? colGapWall : rowGapWall;
  const firstLine = wall(size, first, randInt(rng, 0, size - 1));
  return [...firstLine, ...wall(size, second, randInt(rng, 0, size - 1))];
};

const drawStreamLine = (rng: Rng, size: number): Point[] => {
  const kind = pick(rng, ["col", "row", "partialCol", "partialRow"] as const);
  if (kind === "col") return streamColumn(0, size - 1, randInt(rng, 0, size - 1));
  if (kind === "row") return streamRow(0, size - 1, randInt(rng, 0, size - 1));

  const line = randInt(rng, 0, size - 1);
  const start = randInt(rng, 0, Math.max(0, size - 3));
  const end = Math.min(size - 1, start + randInt(rng, 2, 4));
  return kind === "partialCol" ? streamColumn(start, end, line) : streamRow(start, end, line);
};

const drawStreams = (rng: Rng, size: number, lines: number) => {
  const streams: Point[] = [];
  const streamKeys = new Set<string>();
  for (let line = 0; line < lines; line += 1) {
    drawStreamLine(rng, size).forEach((cell) => {
      if (streamKeys.has(cellKey(cell))) return;
      streamKeys.add(cellKey(cell));
      streams.push(cell);
    });
  }
  return streams;
};

const buildAttempt = (
  dateKey: string,
  tier: number,
  weekend: boolean,
  attempt: number,
): LevelInput => {
  const rng = rngFromKey(`${dateKey}#${attempt}`);
  const row = tierRow(tier);
  const bonus = weekend ? 1 : 0;

  const size = Math.min(MAX_BOARD_SIZE, drawRange(rng, row.size) + bonus);
  const targetCount = Math.min(MAX_TARGETS, drawRange(rng, row.targets) + bonus);
  const probeMode = pick(rng, row.modes);
  const fences = drawFences(rng, size, drawRange(rng, row.fenceLines));
  const streams = drawStreams(rng, size, drawRange(rng, row.streamLines));
  const streamKeys = new Set(streams.map(cellKey));

  const taken = new Set(streamKeys);
  const heavy = drawFreeCells(
    rng,
    size,
    drawRange(rng, row.heavy),
    (cell) => !taken.has(cellKey(cell)),
  );
  heavy.forEach((cell) => taken.add(cellKey(cell)));
  const rocks = drawFreeCells(
    rng,
    size,
    drawRange(rng, row.rocks),
    (cell) => !taken.has(cellKey(cell)),
  );
  const rockKeys = new Set(rocks.map(cellKey));
  const bridges =
    streams.length === 0
      ? []
      : drawFreeCells(rng, size, drawRange(rng, row.bridges), (cell) =>
          streamKeys.has(cellKey(cell)),
        );
  const targets = drawFreeCells(rng, size, targetCount, (cell) => !rockKeys.has(cellKey(cell)));
  const targetKeys = new Set(targets.map(cellKey));
  const bombs = drawFreeCells(
    rng,
    size,
    drawRange(rng, row.bombs),
    (cell) => !rockKeys.has(cellKey(cell)) && !targetKeys.has(cellKey(cell)),
  );

  return {
    v: 2,
    id: `d-${dateKey}`,
    rows: size,
    cols: size,
    targets,
    bombs,
    streams,
    bridges,
    heavy,
    rocks,
    fences,
    probeMode,
  };
};

const withLimits = (level: LevelInput, norm: Norm): LevelInput => ({
  ...level,
  moveLimit: ceilNorm(norm, MOVE_LIMIT_TENTHS),
  stars: [ceilNormPercent(norm, THREE_STARS_PERCENT), ceilNormPercent(norm, TWO_STARS_PERCENT)],
});

const fallbackLevel = (dateKey: string): LevelInput => {
  const rng = rngFromKey(`${dateKey}#fallback`);
  return {
    v: 2,
    id: `d-${dateKey}`,
    rows: FALLBACK_SIZE,
    cols: FALLBACK_SIZE,
    targets: [drawRandomCell(rng, FALLBACK_SIZE)],
    probeMode: "distance",
  };
};

export interface DailyLevel {
  level: LevelInput;
  norm: Norm;
  tier: number;
  attempt: number | null;
}

const finish = (level: LevelInput, tier: number, attempt: number | null): DailyLevel => {
  const { board, rules } = createBoard(level);
  const norm = computeNorm(board, rules, level.id);
  return { level: withLimits(level, norm), norm, tier, attempt };
};

export const generateDaily = (dateKey: string, epochKey = DEFAULT_DAILY_EPOCH): DailyLevel => {
  const tier = dailyTier(dateKey, epochKey);
  const weekend = isWeekend(dateKey);

  for (let attempt = 0; attempt < ATTEMPTS; attempt += 1) {
    const level = buildAttempt(dateKey, tier, weekend, attempt);
    if (validateLevel(level, { kind: "daily" }).length === 0) return finish(level, tier, attempt);
  }

  return finish(fallbackLevel(dateKey), tier, null);
};
