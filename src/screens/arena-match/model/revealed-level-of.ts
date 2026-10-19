import type { LevelInput } from "@reckon-path/engine";

import type { MatchEnd } from "@entities/match";

type Cell = [number, number];

const cellsOf = (cells: readonly (readonly number[])[]) =>
  cells.map(([row = 0, col = 0]): Cell => [row, col]);

export const revealedLevelOf = (layout: LevelInput, { maps }: MatchEnd): LevelInput => ({
  ...layout,
  targets: cellsOf(maps.opponent.targets),
  bombs: cellsOf(maps.opponent.bombs),
});
