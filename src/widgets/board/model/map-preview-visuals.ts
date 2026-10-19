import { applyTap, createBoard, initGame } from "@reckon-path/engine";
import type { Idx, LevelInput } from "@reckon-path/engine";

import { buildCellVisuals } from "./cell-visuals";

export const mapPreviewVisualsOf = (
  level: LevelInput,
  taps: readonly Idx[],
  errors: readonly Idx[] = [],
) => {
  const { board, rules } = createBoard(level);
  const start = initGame(board, rules, { variant: "pvp" });
  const game = taps.reduce((state, cell) => applyTap(state, cell).state, start);
  return buildCellVisuals(game, { flags: [], lastCell: null, showHidden: true, errors });
};
