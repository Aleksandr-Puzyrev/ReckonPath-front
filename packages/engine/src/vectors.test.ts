import { z } from "zod";

import bombHintVectors from "../vectors/bomb-hint.json";
import dailyTierVectors from "../vectors/daily-tier.json";
import dailyVectors from "../vectors/daily.json";
import distanceVectors from "../vectors/distances.json";
import formulaVectors from "../vectors/formulas.json";
import levelCodeVectors from "../vectors/level-codes.json";
import matchVectors from "../vectors/match.json";
import normValidateVectors from "../vectors/norm-validate.json";
import prngVectors from "../vectors/prng.json";
import probeModeVectors from "../vectors/probe-modes.json";
import solverHypothesisVectors from "../vectors/solver-hypotheses.json";
import solverNormVectors from "../vectors/solver-norm.json";
import solverTraceVectors from "../vectors/solver-trace.json";
import starVectors from "../vectors/stars.json";
import tapVectors from "../vectors/taps.json";
import validatorVectors from "../vectors/validator.json";

import { CODE_VECTOR_RUNNERS } from "./test-utils/code-vector-runners";
import { GAME_VECTOR_RUNNERS } from "./test-utils/game-vector-runners";
import { SOLVER_VECTOR_RUNNERS } from "./test-utils/solver-vector-runners";

const MANDATORY_VECTOR_COUNT = 60;

const RUNNERS = { ...GAME_VECTOR_RUNNERS, ...SOLVER_VECTOR_RUNNERS, ...CODE_VECTOR_RUNNERS };

type VectorKind = keyof typeof RUNNERS;
// Safe: Object.keys returns exactly the RUNNERS keys, only typed as string[] (безопасно: Object.keys возвращает ровно ключи RUNNERS, просто с типом string[]).
const KINDS = Object.keys(RUNNERS) as [VectorKind, ...VectorKind[]];

const headerSchema = z.object({
  kind: z.enum(KINDS),
  name: z.string(),
});

const vectors: unknown[] = [
  ...distanceVectors,
  ...tapVectors,
  ...bombHintVectors,
  ...probeModeVectors,
  ...starVectors,
  ...formulaVectors,
  ...prngVectors,
  ...validatorVectors,
  ...normValidateVectors,
  ...dailyTierVectors,
  ...solverNormVectors,
  ...solverHypothesisVectors,
  ...solverTraceVectors,
  ...dailyVectors,
  ...levelCodeVectors,
  ...matchVectors,
];
const headers = vectors.map((vector) => headerSchema.parse(vector));

describe("shared test vectors", () => {
  test("include at least the mandatory set", () => {
    expect(vectors.length).toBeGreaterThanOrEqual(MANDATORY_VECTOR_COUNT);
  });

  test("have unique names", () => {
    const names = headers.map(({ name }) => name);
    expect(new Set(names).size).toBe(names.length);
  });

  test.each(headers.map(({ kind, name }, index) => [name, kind, vectors[index]] as const))(
    "%s",
    (_name, kind, vector) => {
      RUNNERS[kind](vector);
    },
  );
});
