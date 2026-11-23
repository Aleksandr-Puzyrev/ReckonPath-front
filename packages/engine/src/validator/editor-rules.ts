import {
  MAX_BEACONS,
  MAX_BOMBS,
  MAX_BUOYS,
  MAX_ROCK_SHARE,
  MAX_TARGETS,
  PASSABLE_CELLS_PER_BOMB,
} from "../config/engine-config";
import { cellKey } from "../grid/grid";
import type { LevelInput } from "../level/level-schema";
import type { Cell } from "../model/types";

export type EditorMap = Pick<
  LevelInput,
  | "rows"
  | "cols"
  | "targets"
  | "bombs"
  | "streams"
  | "bridges"
  | "heavy"
  | "rocks"
  | "fences"
  | "beacons"
  | "buoys"
>;

export const EDITOR_ELEMENTS = [
  "targets",
  "fences",
  "streams",
  "heavy",
  "rocks",
  "bridges",
  "bombs",
  "beacons",
  "buoys",
] as const;

export type EditorElement = (typeof EDITOR_ELEMENTS)[number];
export type EditorCounts = Record<EditorElement, number>;

export interface EditorCapProblem {
  element: EditorElement;
  max: number;
  count: number;
}

// The backend editor caps of a level without its own (game.DefaultCaps) (лимиты редактора бэкенда для уровня без своих лимитов).
export const DEFAULT_EDITOR_CAPS: EditorCounts = {
  targets: MAX_TARGETS,
  fences: 16,
  streams: 12,
  heavy: 8,
  rocks: 20,
  bridges: 3,
  bombs: MAX_BOMBS,
  beacons: MAX_BEACONS,
  buoys: MAX_BUOYS,
};

const NEIGHBOURS = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
] as const;

// A bridge lies on a stream in the engine model, but the backend counts it apart from the water (в модели движка мост лежит на ручье, но бэкенд считает его отдельно от воды).
const waterOf = ({ streams = [], bridges = [] }: EditorMap) => {
  const bridgeKeys = new Set(bridges.map(cellKey));
  return streams.filter((cell) => !bridgeKeys.has(cellKey(cell)));
};

export const countEditorElements = (map: EditorMap): EditorCounts => ({
  targets: map.targets.length,
  fences: map.fences?.length ?? 0,
  streams: waterOf(map).length,
  heavy: map.heavy?.length ?? 0,
  rocks: map.rocks?.length ?? 0,
  bridges: map.bridges?.length ?? 0,
  bombs: map.bombs?.length ?? 0,
  beacons: map.beacons?.length ?? 0,
  buoys: map.buoys?.length ?? 0,
});

// The default caps with the rock share of the board (лимиты по умолчанию с долей скал на поле).
export const defaultEditorCapsOf = (rows: number, cols: number): EditorCounts => ({
  ...DEFAULT_EDITOR_CAPS,
  rocks: Math.min(DEFAULT_EDITOR_CAPS.rocks, Math.floor(rows * cols * MAX_ROCK_SHARE)),
});

// Bombs also obey the density rule: one per 12 passable cells (бомбы подчиняются и правилу плотности: одна на 12 проходимых клеток).
export const editorLimitsOf = (map: EditorMap, caps: EditorCounts): EditorCounts => {
  const passable = map.rows * map.cols - (map.rocks?.length ?? 0);
  return {
    ...caps,
    bombs: Math.min(caps.bombs, MAX_BOMBS, Math.floor(passable / PASSABLE_CELLS_PER_BOMB)),
  };
};

export const overEditorCap = (map: EditorMap, caps: EditorCounts): EditorCapProblem | null => {
  const counts = countEditorElements(map);
  const limits = editorLimitsOf(map, caps);
  const element = EDITOR_ELEMENTS.find((key) => counts[key] > limits[key]);
  return element === undefined ? null : { element, max: limits[element], count: counts[element] };
};

// The backend wants water next to a bridge (бэкенд требует воду рядом с мостом).
export const findDryBridges = (map: EditorMap): Cell[] => {
  const water = new Set(waterOf(map).map(cellKey));
  return (map.bridges ?? []).filter(
    ([row, col]) => !NEIGHBOURS.some(([dr, dc]) => water.has(cellKey([row + dr, col + dc]))),
  );
};
