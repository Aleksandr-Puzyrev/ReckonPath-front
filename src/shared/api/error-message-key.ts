import { isApiError } from "./api-error";
import type { ApiErrorCode } from "./api-error";

const CODES_WITH_TEXT = [
  "INSUFFICIENT_FUNDS",
  "ALREADY_OWNED",
  "OFFER_ENDED",
  "SOLD_OUT",
  "PRICE_CHANGED",
  "LIMIT_REACHED",
  "MAP_INVALID",
  "IN_MATCH",
  "FRIENDS_LIMIT",
  "RATE_LIMITED",
] as const satisfies readonly ApiErrorCode[];

type CodeWithText = (typeof CODES_WITH_TEXT)[number];
export type ErrorMessageKey = `errors.${CodeWithText}` | "errors.generic" | "errors.NETWORK";

const hasText = (code: ApiErrorCode): code is CodeWithText =>
  CODES_WITH_TEXT.some((known) => known === code);

export const errorMessageKey = (error: unknown): ErrorMessageKey => {
  if (!isApiError(error)) return "errors.NETWORK";
  // TODO: report codes without a text to Sentry once it is set up
  if (error.code === null || !hasText(error.code)) return "errors.generic";
  return `errors.${error.code}`;
};
