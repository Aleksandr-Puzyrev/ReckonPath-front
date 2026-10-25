import { isInsufficientFunds, isSessionRevoked } from "./api-error";

describe("isSessionRevoked", () => {
  test("treats every backend refresh failure as a revoked session", () => {
    expect(isSessionRevoked("session_revoked")).toBe(true);
    expect(isSessionRevoked("invalid_refresh_token")).toBe(true);
    expect(isSessionRevoked("refresh_token_reused")).toBe(true);
  });

  test("keeps an expired access token apart", () => {
    expect(isSessionRevoked("unauthenticated")).toBe(false);
    expect(isSessionRevoked(null)).toBe(false);
  });
});

describe("isInsufficientFunds", () => {
  test("knows both backend names for the shortage", () => {
    expect(isInsufficientFunds("insufficient_funds")).toBe(true);
    expect(isInsufficientFunds("not_enough_gems")).toBe(true);
    expect(isInsufficientFunds("limit_reached")).toBe(false);
  });
});
