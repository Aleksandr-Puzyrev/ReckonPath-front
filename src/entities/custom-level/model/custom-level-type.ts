import type { BackendLevel, LevelInput } from "@reckon-path/engine";

import type { components } from "@shared/api";

// Answers read through openapi-fetch have their tuples widened to arrays, which the engine's backend level accepts (ответы, прочитанные через openapi-fetch, получают кортежи расширенными до массивов — их принимает уровень бэкенда движка).
export type CustomLevelView = Omit<components["schemas"]["CustomLevelView"], "level"> & {
  level: BackendLevel;
};
export type CustomLevelRequest = components["schemas"]["CustomLevelRequest"];

export type Cell = [number, number];

export interface CustomMap {
  rows: number;
  cols: number;
  targets: Cell[];
  bombs?: Cell[];
  streams?: Cell[];
  bridges?: Cell[];
  heavy?: Cell[];
  rocks?: Cell[];
  fences?: [Cell, Cell][];
  beacons?: Cell[];
  buoys?: Cell[];
}

export interface CustomParams {
  probeMode: LevelInput["probeMode"];
  fog: number | null;
  isTargetOrder: boolean;
  hasBombHint: boolean;
  moveLimit: number | null;
}

export interface CustomDraft {
  title: string;
  map: CustomMap;
  params: CustomParams;
}

export interface SavedCustomLevel {
  id: string;
  title: string;
  level: LevelInput;
  updatedAt: string;
}

export interface CustomLevels {
  levels: SavedCustomLevel[];
  max: number;
}
