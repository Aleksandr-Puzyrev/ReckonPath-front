import { createBoard, initGame } from "@reckon-path/engine";
import type { LevelInput } from "@reckon-path/engine";

export const startGame = (level: LevelInput) => {
  const { board, rules } = createBoard(level);
  return initGame(board, rules);
};
