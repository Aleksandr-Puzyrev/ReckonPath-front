import { moveLimitOf } from "@reckon-path/engine";
import type { GameState, Idx, Reveal } from "@reckon-path/engine";

// What the play widgets draw, for a game of the engine or of the server (то, что рисуют виджеты игры — для партии движка или сервера).
export type PlayView = Pick<
  GameState,
  "board" | "rules" | "revealed" | "epoch" | "status" | "movesUsed" | "continued"
> & {
  moveLimit: number | null;
  targetCount: number;
  foundCount: number;
  bombCount: number;
  bombsLeft: number;
  buoyCount: number;
  buoysLeft: number;
  lastCell: Idx | null;
};

export const isStaleIn = ({ epoch }: Pick<PlayView, "epoch">, reveal: Reveal) =>
  "epoch" in reveal && reveal.epoch < epoch;

export const playViewOfGame = (game: GameState, lastCell: Idx | null): PlayView => ({
  board: game.board,
  rules: game.rules,
  revealed: game.revealed,
  epoch: game.epoch,
  status: game.status,
  movesUsed: game.movesUsed,
  continued: game.continued,
  moveLimit: moveLimitOf(game),
  targetCount: game.board.targets.length,
  foundCount: game.found.size,
  bombCount: game.board.bombs.length,
  bombsLeft: game.board.bombs.length - game.bombsHit.size,
  buoyCount: game.board.buoys.length,
  buoysLeft: game.board.buoys.filter((buoy) => !game.revealed.has(buoy)).length,
  lastCell,
});
