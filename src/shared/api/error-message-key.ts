import { isApiError, isInsufficientFunds } from "./api-error";
import type { ApiErrorCode, ApiErrorDetails } from "./api-error";

const CODES_WITH_TEXT = [
  "nick_taken",
  "email_taken",
  "invalid_credentials",
  "invalid_code",
  "wrong_password",
  "same_email",
  "too_many_attempts",
  "insufficient_funds",
  "already_owned",
  "offer_ended",
  "sold_out",
  "price_changed",
  "limit_reached",
  "map_invalid",
  "level_invalid",
  "level_not_found",
  "in_match",
  "friends_limit",
  "already_friends",
  "request_exists",
  "requests_limit",
  "request_not_found",
  "not_friends",
  "user_not_found",
  "invite_invalid",
  "invite_used",
  "invite_expired",
  "invite_self",
  "too_many_requests",
  "rival_busy",
  "challenge_not_found",
  "season_changing",
  "arena_locked",
  "match_in_progress",
  "tickets_limit",
  "rate_limit_unavailable",
  "report_duplicate",
  "player_not_found",
  "friend_self",
] as const satisfies readonly ApiErrorCode[];

type CodeWithText = (typeof CODES_WITH_TEXT)[number];
export type ErrorMessageKey =
  `errors.${CodeWithText}` | "errors.arena_banned" | "errors.generic" | "errors.NETWORK";
type ErrorScope = "arena";

const hasText = (code: ApiErrorCode): code is CodeWithText =>
  CODES_WITH_TEXT.some((known) => known === code);

// A ban met by an arena action is the arena ban: a full ban closes the whole app (бан, встреченный действием арены, — бан арены: полный бан закрывает всё приложение).
export const errorMessageKey = (error: unknown, scope?: ErrorScope): ErrorMessageKey => {
  if (!isApiError(error)) return "errors.NETWORK";
  if (scope === "arena" && error.code === "banned") return "errors.arena_banned";
  // TODO: report codes without a text to Sentry once it is set up
  const code = isInsufficientFunds(error.code) ? "insufficient_funds" : error.code;
  if (code === null || !hasText(code)) return "errors.generic";
  return `errors.${code}`;
};

// The texts take their values from the error details, such as the unlock level of arena_locked (тексты берут значения из деталей ошибки, например уровень открытия у arena_locked).
export const errorMessageValues = (error: unknown): ApiErrorDetails =>
  isApiError(error) ? error.details : {};
