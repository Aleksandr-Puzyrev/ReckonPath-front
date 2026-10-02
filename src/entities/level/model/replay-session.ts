import { applyTap, continueGame, createBoard, initGame } from "@reckon-path/engine";
import type { GameState, Idx, LevelInput } from "@reckon-path/engine";

export type ContinueMethod = "ad" | "emeralds";

export type SessionAction =
  { type: "tap"; cell: Idx } | { type: "continue"; method: ContinueMethod };

export const startGame = (level: LevelInput) => {
  const { board, rules } = createBoard(level);
  return initGame(board, rules);
};

export const applyAction = (game: GameState, action: SessionAction) =>
  action.type === "tap" ? applyTap(game, action.cell).state : continueGame(game);

export const replaySession = (level: LevelInput, actions: readonly SessionAction[]) =>
  actions.reduce(applyAction, startGame(level));
