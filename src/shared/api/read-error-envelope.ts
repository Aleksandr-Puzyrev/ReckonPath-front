import { z } from "zod";

import type { ApiErrorCode } from "./api-error";
import { errorCodeValues } from "./generated/schema";

const errorEnvelopeSchema = z.object({
  error: z.object({
    code: z.string(),
    details: z.record(z.string(), z.unknown()).optional(),
  }),
});

export interface ErrorEnvelope {
  code: ApiErrorCode | null;
  details: Record<string, unknown>;
}

const isErrorCode = (code: string): code is ApiErrorCode =>
  errorCodeValues.some((known) => known === code);

export const readErrorEnvelope = (body: unknown): ErrorEnvelope => {
  const parsed = errorEnvelopeSchema.safeParse(body);
  if (!parsed.success) return { code: null, details: {} };
  const { code, details = {} } = parsed.data.error;
  return { code: isErrorCode(code) ? code : null, details };
};
