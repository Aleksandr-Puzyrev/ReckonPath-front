import { isApiError, isInsufficientFunds } from "./api-error";
import type { ApiErrorCode } from "./api-error";

const CODES_WITH_TEXT = [
  "nick_taken",
  "email_taken",
  "invalid_credentials",
  "insufficient_funds",
  "already_owned",
  "offer_ended",
  "sold_out",
  "price_changed",
  "limit_reached",
  "map_invalid",
  "in_match",
  "friends_limit",
  "too_many_requests",
] as const satisfies readonly ApiErrorCode[];

type CodeWithText = (typeof CODES_WITH_TEXT)[number];
export type ErrorMessageKey = `errors.${CodeWithText}` | "errors.generic" | "errors.NETWORK";

const hasText = (code: ApiErrorCode): code is CodeWithText =>
  CODES_WITH_TEXT.some((known) => known === code);

export const errorMessageKey = (error: unknown): ErrorMessageKey => {
  if (!isApiError(error)) return "errors.NETWORK";
  // TODO: report codes without a text to Sentry once it is set up
  const code = isInsufficientFunds(error.code) ? "insufficient_funds" : error.code;
  if (code === null || !hasText(code)) return "errors.generic";
  return `errors.${code}`;
};
