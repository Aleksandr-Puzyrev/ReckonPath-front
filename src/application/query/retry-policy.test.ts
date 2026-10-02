import { ApiError, RequestTimeoutError } from "@shared/api";

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
    expect(shouldRetry(0, new ApiError(500, "INTERNAL"))).toBe(true);
  });

  test("does not retry a client error", () => {
    expect(shouldRetry(0, new ApiError(404, "NOT_FOUND"))).toBe(false);
    expect(shouldRetry(0, new ApiError(426, "UPGRADE_REQUIRED"))).toBe(false);
  });

  test("does not retry maintenance", () => {
    expect(shouldRetry(0, new ApiError(503, "MAINTENANCE"))).toBe(false);
  });
});

describe("retryDelay", () => {
  test("waits 1, 2 and 4 seconds", () => {
    expect([0, 1, 2].map(retryDelay)).toEqual([1000, 2000, 4000]);
  });
});
