import { applyTap, createBoard, initGame } from "@reckon-path/engine";
import type { Idx, LevelInput } from "@reckon-path/engine";

import { buildCellVisuals } from "./cell-visuals";

export const tryoutVisualsOf = (level: LevelInput, taps: readonly Idx[]) => {
  const { board, rules } = createBoard(level);
  const game = taps.reduce((state, cell) => applyTap(state, cell).state, initGame(board, rules));
  return buildCellVisuals(game, { flags: [], lastCell: taps.at(-1) ?? null, showHidden: false });
};
