import { z } from "zod";

import type { components } from "@shared/api";

export type LevelProblem = components["schemas"]["LevelProblem"];

const cellSchema = z.tuple([z.number().int(), z.number().int()]);

const problemsSchema = z
  .array(
    z.object({
      code: z.string(),
      message: z.string(),
      cells: z.array(cellSchema).optional(),
      element: z.string().optional(),
      min: z.number().int().optional(),
      max: z.number().int().optional(),
      count: z.number().int().optional(),
    }) satisfies z.ZodType<LevelProblem>,
  )
  .catch([]);

// The problems of 422 level_invalid come in the error details (проблемы 422 level_invalid приходят в деталях ошибки).
export const levelProblemsOf = (details: Record<string, unknown>): LevelProblem[] =>
  problemsSchema.parse(details.problems);
