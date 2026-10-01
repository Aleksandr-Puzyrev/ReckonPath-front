import { LEVEL_SOLVER_BOMB_PENALTY, PVP_SOLVER_BOMB_PENALTY } from "../config/engine-config";
import { applyTap, initGame } from "../game/game";
import { cellCount } from "../grid/grid";
import { createBoard } from "../level/create-board";
import type { LevelInput } from "../level/level-schema";
import type { Board, GameState, Idx, LevelRules } from "../model/types";
import { rngFromKey } from "../random/random";
import type { ValidationContext } from "../validator/validate-level";

import { chooseMove, createSolver, observeTap, scoreCells } from "./solver";
import type { CellScore, SolverState } from "./solver";

export const NORM_RUNS = 32;
const MIN_NORM_SUM = 3 * NORM_RUNS;
const MOVE_LIMIT_MIN_TENTHS = 12;

const ceilDiv = (numerator: number, denominator: number) =>
  Math.floor((numerator + denominator - 1) / denominator);

// Runs differ only in tie-breaks, so the state after the same taps is shared between runs (прогоны отличаются только разбором ничьих, поэтому состояние после одинаковых тапов общее).
interface Step {
  game: GameState;
  solver: SolverState;
  scores: readonly CellScore[];
  children: Map<Idx, Step>;
}

const createStep = (game: GameState, solver: SolverState): Step => ({
  game,
  solver,
  scores: game.status === "playing" ? scoreCells(solver) : [],
  children: new Map(),
});

const createRootStep = (board: Board, rules: LevelRules, levelId: string, penalty: number) => {
  const game = initGame(board, { ...rules, moveLimit: null });
  return createStep(game, createSolver(game, { levelId, penalty }));
};

const nextStep = (step: Step, cell: Idx): Step => {
  const cached = step.children.get(cell);
  if (cached !== undefined) return cached;

  const result = applyTap(step.game, cell);
  if (result.events.some(({ type }) => type === "blocked" || type === "alreadyRevealed")) {
    throw new Error(`The solver tapped an unavailable cell ${cell}`);
  }
  const next = createStep(result.state, observeTap(step.solver, cell, result.events, result.state));
  step.children.set(cell, next);
  return next;
};

const playRun = (root: Step, levelId: string, run: number) => {
  const rng = rngFromKey(`${levelId}#${run}`);
  const maxTaps = cellCount(root.game.board);
  let step = root;

  for (let tap = 0; tap < maxTaps && step.game.status === "playing"; tap += 1) {
    step = nextStep(step, chooseMove(step.solver, rng, { scores: step.scores }));
  }

  if (step.game.status !== "won") throw new Error("The solver did not finish the level");
  return step.game.movesUsed;
};

export const solveOnce = (
  board: Board,
  rules: LevelRules,
  levelId: string,
  run: number,
  penalty = LEVEL_SOLVER_BOMB_PENALTY,
) => playRun(createRootStep(board, rules, levelId, penalty), levelId, run);

export interface Norm {
  normSum: number;
  norm: number;
}

export const computeNorm = (
  board: Board,
  rules: LevelRules,
  levelId: string,
  penalty = LEVEL_SOLVER_BOMB_PENALTY,
): Norm => {
  const root = createRootStep(board, rules, levelId, penalty);
  let normSum = 0;
  for (let run = 0; run < NORM_RUNS; run += 1) normSum += playRun(root, levelId, run);

  return { normSum, norm: normSum / NORM_RUNS };
};

// Integer forms of ceil(factor · norm) with norm = normSum / 32 (целочисленные формы ceil(множитель · норма)).
export const ceilNorm = ({ normSum }: Norm, tenths: number) =>
  ceilDiv(tenths * normSum, 10 * NORM_RUNS);

export const ceilNormPercent = ({ normSum }: Norm, percent: number) =>
  ceilDiv(percent * normSum, 100 * NORM_RUNS);

export interface NormValidationError {
  code: "TRIVIAL" | "MOVE_LIMIT";
  norm: number;
}

export const validateLevelNorm = (
  level: LevelInput,
  context: ValidationContext,
  norm?: Norm,
): NormValidationError[] => {
  const { board, rules } = createBoard(level);
  const penalty = context.kind === "pvp" ? PVP_SOLVER_BOMB_PENALTY : LEVEL_SOLVER_BOMB_PENALTY;
  const measured = norm ?? computeNorm(board, rules, level.id, penalty);
  const errors: NormValidationError[] = [];

  if ((context.kind === "pvp" || context.kind === "custom") && measured.normSum < MIN_NORM_SUM) {
    errors.push({ code: "TRIVIAL", norm: measured.norm });
  }

  if (context.kind === "campaign" || context.kind === "daily") {
    const limit = rules.moveLimit;
    const stars = rules.stars;
    const isLimitTooLow = limit === null || limit < ceilNorm(measured, MOVE_LIMIT_MIN_TENTHS);
    const areStarsInvalid =
      stars !== null && limit !== null && (stars[0] > stars[1] || stars[1] > limit);
    if (isLimitTooLow || areStarsInvalid) errors.push({ code: "MOVE_LIMIT", norm: measured.norm });
  }

  return errors;
};
