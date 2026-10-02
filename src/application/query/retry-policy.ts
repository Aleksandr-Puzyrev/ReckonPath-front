import { isApiError } from "@shared/api";

const MAX_RETRIES = 3;
const FIRST_RETRY_DELAY_MS = 1000;
const HTTP_SERVER_ERROR = 500;

const isRetryable = (error: unknown) => {
  if (!isApiError(error)) return true;
  return error.status >= HTTP_SERVER_ERROR && error.code !== "MAINTENANCE";
};

export const shouldRetry = (failureCount: number, error: unknown) =>
  failureCount < MAX_RETRIES && isRetryable(error);

export const retryDelay = (failureCount: number) => FIRST_RETRY_DELAY_MS * 2 ** failureCount;
