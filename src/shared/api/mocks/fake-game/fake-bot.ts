import {
  chooseMove,
  createSolver,
  leagueOf,
  observeTap,
  PVP_SOLVER_BOMB_PENALTY,
  toCell,
} from "@reckon-path/engine";
import type { GameState, League, Rng } from "@reckon-path/engine";

import type { BoardTap } from "./match-board";

const THINK_MIN_MS = 1200;
const THINK_RANGE_MS = 2800;
const TIMEOUT_CHANCE = 0.02;
// Part 1 §5.6 names Bronze, Gold and Diamond; the leagues between take the lower neighbour (Часть 1 §5.6 называет Bronze, Gold и Diamond; лиги между ними берут нижнего соседа).
const MISTAKE_CHANCE: Record<League, number> = {
  bronze: 0.4,
  silver: 0.4,
  gold: 0.2,
  platinum: 0.2,
  diamond: 0.05,
  master: 0.05,
};

export const createFakeBot = (game: GameState, trophies: number, rng: Rng, isEasy: boolean) => {
  let solver = createSolver(game, { levelId: "u-arena-match", penalty: PVP_SOLVER_BOMB_PENALTY });
  // The easy bot of the training and the first bot match only guesses (Part 1 §5.12) (лёгкий бот тренировки и первого матча с ботом только угадывает).
  const mistakeChance = isEasy ? 1 : MISTAKE_CHANCE[leagueOf(trophies)];

  return {
    thinkMs: () => (rng() < TIMEOUT_CHANCE ? null : THINK_MIN_MS + rng() * THINK_RANGE_MS),
    chooseCell: () => toCell(game.board.cols, chooseMove(solver, rng, { mistakeChance })),
    observe: ({ idx, events, game: next }: BoardTap) => {
      solver = observeTap(solver, idx, events, next);
    },
  };
};
