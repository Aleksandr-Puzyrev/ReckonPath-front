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
