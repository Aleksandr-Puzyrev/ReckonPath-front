import { ApiError } from "./api-error";
import { errorMessageKey } from "./error-message-key";

describe("errorMessageKey", () => {
  test("maps a server code with a text to its key", () => {
    expect(errorMessageKey(new ApiError(422, "INSUFFICIENT_FUNDS"))).toBe(
      "errors.INSUFFICIENT_FUNDS",
    );
  });

  test("falls back to the generic text for a code without a text", () => {
    expect(errorMessageKey(new ApiError(400, "VALIDATION"))).toBe("errors.generic");
  });

  test("falls back to the generic text for an unknown code", () => {
    expect(errorMessageKey(new ApiError(500, null))).toBe("errors.generic");
  });

  test("treats a failed request without a response as a network error", () => {
    expect(errorMessageKey(new TypeError("Network request failed"))).toBe("errors.NETWORK");
  });
});
