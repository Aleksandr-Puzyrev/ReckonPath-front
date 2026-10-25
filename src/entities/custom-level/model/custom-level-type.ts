import type { LevelInput } from "@reckon-path/engine";

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
