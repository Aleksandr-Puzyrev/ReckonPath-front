import { ApiError } from "./api-error";
import { readErrorEnvelope } from "./read-error-envelope";

interface ApiResult<T> {
  data?: T;
  error?: unknown;
  response: Response;
}

export const readData = <T>({ data, error, response }: ApiResult<T>): T => {
  if (response.ok && data !== undefined) return data;
  const { code, details } = readErrorEnvelope(error);
  throw new ApiError(response.status, code, details);
};
