import type { LevelInput } from "@reckon-path/engine";

import type { MapLayout } from "./match-reducer";

type Cell = [number, number];

const cellOf = ([row = 0, col = 0]: readonly number[]): Cell => [row, col];

const cellsOf = (cells: readonly (readonly number[])[] | undefined) => cells?.map(cellOf);

// The opponent's targets and bombs stay on the server, so the board is built from the layout alone (цели и бомбы соперника остаются на сервере, поэтому поле строится только по раскладке).
export const layoutLevelOf = (layout: MapLayout, size: number): LevelInput => ({
  v: 2,
  id: "u-arena-match",
  rows: size,
  cols: size,
  targets: [],
  probeMode: "distance",
  streams: cellsOf(layout.streams),
  bridges: cellsOf(layout.bridges),
  heavy: cellsOf(layout.heavy),
  rocks: cellsOf(layout.rocks),
  fences: layout.fences?.map(([a = [], b = []]): [Cell, Cell] => [cellOf(a), cellOf(b)]),
});
