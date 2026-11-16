import { z } from "zod";

import { xpToNext } from "../formulas/rewards";
import { applyTap, canContinue, continueGame, initGame } from "../game/game";
import { toCell, toIdx } from "../grid/grid";
import { createBoard } from "../level/create-board";
import type { GameEvent, GameState } from "../model/types";
import { fnv1a32, mulberry32 } from "../random/random";
import { validateLevel } from "../validator/validate-level";

import { cellSchema, contextSchema, levelVectorSchema } from "./vector-schemas";
import type { VectorRunner } from "./vector-schemas";

const UINT32_RANGE = 2 ** 32;

const looseRecord = z.record(z.string(), z.unknown());

const gameVectorSchema = levelVectorSchema.extend({
  variant: z.enum(["level", "pvp"]).optional(),
  actions: z.array(
    z.union([z.object({ tap: cellSchema }), z.object({ continue: z.literal(true) })]),
  ),
  expect: z.object({
    events: z.array(looseRecord).optional(),
    state: looseRecord.optional(),
    reveals: z.array(z.object({ cell: cellSchema }).catchall(z.unknown())).optional(),
    winStars: z.number().nullable().optional(),
    canContinue: z.boolean().optional(),
  }),
});

const externalEvent = (state: GameState, event: GameEvent) => {
  if (event.type === "win" || event.type === "lose") return event;
  const cell = toCell(state.board.cols, event.cell);
  if (event.type === "reveal") {
    const { reveal, ...rest } = event;
    return { ...rest, cell, ...reveal };
  }

  return { ...event, cell };
};

const runGame: VectorRunner = (raw) => {
  const vector = gameVectorSchema.parse(raw);
  expect(validateLevel(vector.level, { kind: "campaign" })).toEqual([]);

  const { board, rules } = createBoard(vector.level);
  let state = initGame(board, rules, { variant: vector.variant ?? "level" });
  const events: Record<string, unknown>[] = [];

  vector.actions.forEach((action) => {
    if ("continue" in action) {
      state = continueGame(state);
      return;
    }
    const result = applyTap(state, toIdx(board.cols, action.tap));
    result.events.forEach((event) => events.push(externalEvent(result.state, event)));
    state = result.state;
  });

  const { expect: expected } = vector;
  if (expected.events !== undefined) expect(events).toMatchObject(expected.events);
  if (expected.state !== undefined) expect(state).toMatchObject(expected.state);
  expected.reveals?.forEach(({ cell, ...fields }) => {
    expect(state.revealed.get(toIdx(board.cols, cell))).toMatchObject(fields);
  });
  if (expected.winStars !== undefined) {
    expect(events.find((event) => event.type === "win")).toMatchObject({
      stars: expected.winStars,
    });
  }
  if (expected.canContinue !== undefined) expect(canContinue(state)).toBe(expected.canContinue);
};

export const codesOf = (errors: readonly { code: string }[]) =>
  errors.map(({ code }) => code).sort();

const validateVectorSchema = levelVectorSchema.extend({
  context: contextSchema,
  expect: z.object({ codes: z.array(z.string()) }),
});

const runValidate: VectorRunner = (raw) => {
  const vector = validateVectorSchema.parse(raw);
  expect(codesOf(validateLevel(vector.level, vector.context))).toEqual(
    [...vector.expect.codes].sort(),
  );
};

const xpToNextInput = z.object({ level: z.number() });

const FORMULAS: Record<string, (input: unknown) => unknown> = {
  xpToNext: (input) => xpToNext(xpToNextInput.parse(input).level),
};

const formulaVectorSchema = z.object({ fn: z.string(), input: z.unknown(), expect: z.unknown() });

const runFormula: VectorRunner = (raw) => {
  const vector = formulaVectorSchema.parse(raw);
  const formula = FORMULAS[vector.fn];
  if (formula === undefined) throw new Error(`Unknown formula ${vector.fn}`);
  expect(formula(vector.input)).toEqual(vector.expect);
};

const prngVectorSchema = z.object({
  key: z.string(),
  expect: z.object({ seed: z.number(), u32: z.array(z.number()) }),
});

const runPrng: VectorRunner = (raw) => {
  const vector = prngVectorSchema.parse(raw);
  expect(fnv1a32(vector.key)).toBe(vector.expect.seed);
  const rng = mulberry32(vector.expect.seed);
  expect(vector.expect.u32.map(() => rng() * UINT32_RANGE)).toEqual(vector.expect.u32);
};

export const GAME_VECTOR_RUNNERS = {
  game: runGame,
  validate: runValidate,
  formula: runFormula,
  prng: runPrng,
};
