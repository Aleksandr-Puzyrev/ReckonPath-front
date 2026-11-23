import type { Cell, ProbeMode } from "../model/types";

import type { LevelInput } from "./level-schema";

export type BackendLevelMode = "number" | "hot_cold" | "course";

type Point = [number, number];
// Answers read through openapi-fetch widen cell tuples to arrays (ответы, прочитанные через openapi-fetch, расширяют кортежи клеток до массивов).
type BackendCell = readonly number[];

export interface BackendLevel {
  rows: number;
  cols: number;
  terrain: readonly string[];
  fences?: readonly (readonly BackendCell[])[];
  beacons?: readonly BackendCell[];
  targets: readonly BackendCell[];
  bombs?: readonly BackendCell[];
  buoys?: readonly BackendCell[];
  mode: BackendLevelMode;
  fog?: number;
  order?: boolean;
  noBombHint?: boolean;
  limit: number;
  stars: readonly number[];
}

export interface PlainBackendLevel {
  rows: number;
  cols: number;
  terrain: string[];
  fences: [Point, Point][];
  beacons: Point[];
  targets: Point[];
  bombs: Point[];
  buoys: Point[];
  mode: BackendLevelMode;
  fog: number;
  order: boolean;
  noBombHint: boolean;
  limit: number;
  stars: number[];
}

const PLAIN = ".";
const STREAM = "s";
const BRIDGE = "b";
const HEAVY = "h";
const ROCK = "r";

const MODE_TO_ENGINE: Record<BackendLevelMode, ProbeMode> = {
  number: "distance",
  hot_cold: "hotcold",
  course: "direction",
};

const MODE_TO_BACKEND: Record<ProbeMode, BackendLevelMode> = {
  distance: "number",
  hotcold: "hot_cold",
  direction: "course",
};

export const pointOf = ([row = 0, col = 0]: BackendCell): Point => [row, col];

const pointsOf = (cells: readonly BackendCell[] | undefined) => (cells ?? []).map(pointOf);

const fenceOf = ([from = [], to = []]: readonly BackendCell[]): [Point, Point] => [
  pointOf(from),
  pointOf(to),
];

const cellsWith = (terrain: readonly string[], chars: string) =>
  terrain.flatMap((line, row) =>
    [...line].flatMap((char, col): Point[] => (chars.includes(char) ? [[row, col]] : [])),
  );

const starsOf = (level: BackendLevel): [number, number] | null => {
  const [three, two] = level.stars;
  return level.limit === 0 || three === undefined || two === undefined ? null : [three, two];
};

// The backend draws a bridge as its own terrain cell; the engine lays it over a stream (бэкенд рисует мост отдельной клеткой рельефа, движок кладёт его поверх ручья).
export const levelFromBackend = (level: BackendLevel, id: string): LevelInput => ({
  v: 2,
  id,
  rows: level.rows,
  cols: level.cols,
  targets: pointsOf(level.targets),
  bombs: pointsOf(level.bombs),
  streams: cellsWith(level.terrain, STREAM + BRIDGE),
  bridges: cellsWith(level.terrain, BRIDGE),
  heavy: cellsWith(level.terrain, HEAVY),
  rocks: cellsWith(level.terrain, ROCK),
  fences: (level.fences ?? []).map(fenceOf),
  beacons: pointsOf(level.beacons),
  buoys: pointsOf(level.buoys),
  targetOrder: level.order ?? false,
  fog: level.fog === undefined || level.fog === 0 ? null : level.fog,
  probeMode: MODE_TO_ENGINE[level.mode],
  moveLimit: level.limit === 0 ? null : level.limit,
  stars: starsOf(level),
  bombHint: level.noBombHint !== true,
});

const keyOf = ([row, col]: Cell) => `${row}:${col}`;

const terrainOf = (level: LevelInput) => {
  const chars = new Map<string, string>();
  const mark = (cells: readonly Cell[] | undefined, char: string) =>
    (cells ?? []).forEach((cell) => chars.set(keyOf(cell), char));
  mark(level.streams, STREAM);
  mark(level.heavy, HEAVY);
  mark(level.rocks, ROCK);
  mark(level.bridges, BRIDGE);
  return Array.from({ length: level.rows }, (_, row) =>
    Array.from({ length: level.cols }, (__, col) => chars.get(keyOf([row, col])) ?? PLAIN).join(""),
  );
};

export const levelToBackend = (level: LevelInput): PlainBackendLevel => ({
  rows: level.rows,
  cols: level.cols,
  terrain: terrainOf(level),
  fences: (level.fences ?? []).map(fenceOf),
  beacons: pointsOf(level.beacons),
  targets: pointsOf(level.targets),
  bombs: pointsOf(level.bombs),
  buoys: pointsOf(level.buoys),
  mode: MODE_TO_BACKEND[level.probeMode],
  fog: level.fog ?? 0,
  order: level.targetOrder ?? false,
  noBombHint: level.bombHint === false,
  limit: level.moveLimit ?? 0,
  stars: [...(level.stars ?? [0, 0])],
});
