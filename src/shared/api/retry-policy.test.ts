import { ApiError } from "./api-error";
import { RequestTimeoutError } from "./api-fetch";
import { retryDelay, shouldRetry } from "./retry-policy";

describe("shouldRetry", () => {
  test("retries a network failure three times", () => {
    const error = new TypeError("Network request failed");

    expect([0, 1, 2, 3].map((count) => shouldRetry(count, error))).toEqual([
      true,
      true,
      true,
      false,
    ]);
  });

  test("retries a timeout and a server error", () => {
    expect(shouldRetry(0, new RequestTimeoutError())).toBe(true);
    expect(shouldRetry(0, new ApiError(500, "internal_error"))).toBe(true);
  });

  test("does not retry a client error", () => {
    expect(shouldRetry(0, new ApiError(404, "not_found"))).toBe(false);
    expect(shouldRetry(0, new ApiError(426, "app_update_required"))).toBe(false);
  });

  test("does not retry maintenance", () => {
    expect(shouldRetry(0, new ApiError(503, "maintenance"))).toBe(false);
  });
});

describe("retryDelay", () => {
  test("waits 1, 2 and 4 seconds", () => {
    expect([0, 1, 2].map(retryDelay)).toEqual([1000, 2000, 4000]);
  });
});
