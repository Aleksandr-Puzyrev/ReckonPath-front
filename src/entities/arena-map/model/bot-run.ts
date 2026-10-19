import {
  applyTap,
  chooseMove,
  createBoard,
  createSolver,
  initGame,
  observeTap,
  PVP_SOLVER_BOMB_PENALTY,
  rngFromKey,
} from "@reckon-path/engine";
import type { Idx } from "@reckon-path/engine";

import type { PvpMap } from "./arena-map-type";
import { levelOfMap } from "./level-of-map";

export interface BotRun {
  taps: Idx[];
  moves: number;
  found: number;
}

export const runBot = (map: PvpMap): BotRun => {
  const level = levelOfMap(map);
  const { board, rules } = createBoard(level);
  let game = initGame(board, { ...rules, moveLimit: null });
  let solver = createSolver(game, { levelId: level.id, penalty: PVP_SOLVER_BOMB_PENALTY });
  const rng = rngFromKey(`${level.id}#check`);
  const taps: Idx[] = [];

  while (game.status === "playing" && taps.length < board.rows * board.cols) {
    const cell = chooseMove(solver, rng);
    const { state, events } = applyTap(game, cell);
    solver = observeTap(solver, cell, events, state);
    game = state;
    taps.push(cell);
  }

  return { taps, moves: game.movesUsed, found: game.found.size };
};
