import type { components } from "./generated/schema";

export type ApiErrorCode = components["schemas"]["ErrorCode"];
export type ApiErrorDetails = Record<string, unknown>;

export class ApiError extends Error {
  readonly status: number;
  readonly code: ApiErrorCode | null;
  readonly details: ApiErrorDetails;

  constructor(status: number, code: ApiErrorCode | null, details: ApiErrorDetails = {}) {
    super(code ?? `HTTP ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const isApiError = (error: unknown): error is ApiError => error instanceof ApiError;

// The backend names the same case differently in different features (бэкенд называет один и тот же случай по-разному в разных функциях).
const INSUFFICIENT_FUNDS_CODES: readonly ApiErrorCode[] = ["insufficient_funds", "not_enough_gems"];
const SESSION_REVOKED_CODES: readonly ApiErrorCode[] = [
  "session_revoked",
  "invalid_refresh_token",
  "refresh_token_reused",
];

export const isInsufficientFunds = (code: ApiErrorCode | null) =>
  code !== null && INSUFFICIENT_FUNDS_CODES.includes(code);

export const isSessionRevoked = (code: ApiErrorCode | null) =>
  code !== null && SESSION_REVOKED_CODES.includes(code);
