import { z } from "zod";

import { LEVEL_SOLVER_BOMB_PENALTY } from "../config/engine-config";
import { dailyTier, generateDaily, isWeekend } from "../daily/generate-daily";
import { applyTap, initGame } from "../game/game";
import { toCell, toIdx } from "../grid/grid";
import { createBoard } from "../level/create-board";
import type { LevelInput } from "../level/level-schema";
import type { Cell } from "../model/types";
import { rngFromKey } from "../random/random";
import { computeNorm, NORM_RUNS, validateLevelNorm } from "../solver/norm";
import { chooseMove, createSolver, observeTap } from "../solver/solver";

import { codesOf } from "./game-vector-runners";
import { cellSchema, contextSchema, levelVectorSchema } from "./vector-schemas";
import type { VectorRunner } from "./vector-schemas";

const startSolver = (level: LevelInput) => {
  const { board, rules } = createBoard(level);
  const game = initGame(board, { ...rules, moveLimit: null });
  return {
    game,
    solver: createSolver(game, { levelId: level.id, penalty: LEVEL_SOLVER_BOMB_PENALTY }),
  };
};

const hypothesesVectorSchema = levelVectorSchema.extend({
  taps: z.array(cellSchema),
  expect: z.object({
    hypotheses: z.array(z.array(cellSchema)).optional(),
    count: z.number().optional(),
    contains: z.array(cellSchema).optional(),
  }),
});

const runHypotheses: VectorRunner = (raw) => {
  const vector = hypothesesVectorSchema.parse(raw);
  let { game, solver } = startSolver(vector.level);
  const { cols } = game.board;
  vector.taps.forEach((cell) => {
    const idx = toIdx(cols, cell);
    const result = applyTap(game, idx);
    solver = observeTap(solver, idx, result.events, result.state);
    game = result.state;
  });

  const hypotheses = solver.hypotheses.map((hypothesis) =>
    hypothesis.map((idx) => toCell(cols, idx)),
  );
  const { expect: expected } = vector;
  if (expected.hypotheses !== undefined) expect(hypotheses).toEqual(expected.hypotheses);
  if (expected.count !== undefined) expect(hypotheses).toHaveLength(expected.count);
  if (expected.contains !== undefined) expect(hypotheses).toContainEqual(expected.contains);
};

const traceVectorSchema = levelVectorSchema.extend({
  run: z.number().int(),
  expect: z.object({ taps: z.array(cellSchema), movesUsed: z.number() }),
});

const runTrace: VectorRunner = (raw) => {
  const vector = traceVectorSchema.parse(raw);
  let { game, solver } = startSolver(vector.level);
  const rng = rngFromKey(`${vector.level.id}#${vector.run}`);
  const taps: Cell[] = [];
  // A solver never needs more taps than cells; the bound stops a broken solver (решателю не нужно тапов больше, чем клеток; граница останавливает сломанный решатель).
  while (game.status === "playing" && taps.length <= game.board.kinds.length) {
    const idx = chooseMove(solver, rng);
    const result = applyTap(game, idx);
    solver = observeTap(solver, idx, result.events, result.state);
    game = result.state;
    taps.push(toCell(game.board.cols, idx));
  }
  expect({ taps, movesUsed: game.movesUsed }).toEqual(vector.expect);
};

const normVectorSchema = levelVectorSchema.extend({ expect: z.object({ normSum: z.number() }) });

const runNorm: VectorRunner = (raw) => {
  const vector = normVectorSchema.parse(raw);
  const { board, rules } = createBoard(vector.level);
  expect(computeNorm(board, rules, vector.level.id).normSum).toBe(vector.expect.normSum);
};

const normValidateVectorSchema = levelVectorSchema.extend({
  context: contextSchema,
  normSum: z.number(),
  expect: z.object({ codes: z.array(z.string()) }),
});

const runNormValidate: VectorRunner = (raw) => {
  const vector = normValidateVectorSchema.parse(raw);
  const norm = { normSum: vector.normSum, norm: vector.normSum / NORM_RUNS };
  expect(codesOf(validateLevelNorm(vector.level, vector.context, norm))).toEqual(
    [...vector.expect.codes].sort(),
  );
};

const dailyTierVectorSchema = z.object({
  dateKey: z.string(),
  epochKey: z.string().optional(),
  expect: z.object({ tier: z.number(), weekend: z.boolean() }),
});

const runDailyTier: VectorRunner = (raw) => {
  const vector = dailyTierVectorSchema.parse(raw);
  expect(dailyTier(vector.dateKey, vector.epochKey)).toBe(vector.expect.tier);
  expect(isWeekend(vector.dateKey)).toBe(vector.expect.weekend);
};

const dailyVectorSchema = z.object({
  dateKey: z.string(),
  epochKey: z.string(),
  expect: z.object({
    tier: z.number(),
    attempt: z.number().nullable(),
    normSum: z.number(),
    level: z.unknown(),
  }),
});

const runDaily: VectorRunner = (raw) => {
  const vector = dailyVectorSchema.parse(raw);
  const daily = generateDaily(vector.dateKey, vector.epochKey);
  expect({
    tier: daily.tier,
    attempt: daily.attempt,
    normSum: daily.norm.normSum,
    level: daily.level,
  }).toEqual(vector.expect);
};

export const SOLVER_VECTOR_RUNNERS = {
  hypotheses: runHypotheses,
  solverTrace: runTrace,
  norm: runNorm,
  normValidate: runNormValidate,
  dailyTier: runDailyTier,
  daily: runDaily,
};
