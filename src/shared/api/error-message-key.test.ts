import { ApiError } from "./api-error";
import { errorMessageKey } from "./error-message-key";

describe("errorMessageKey", () => {
  test("maps a server code with a text to its key", () => {
    expect(errorMessageKey(new ApiError(422, "insufficient_funds"))).toBe(
      "errors.insufficient_funds",
    );
  });

  test("shows the shortage text for the backend's gems shortage code", () => {
    expect(errorMessageKey(new ApiError(409, "not_enough_gems"))).toBe("errors.insufficient_funds");
  });

  test("falls back to the generic text for a code without a text", () => {
    expect(errorMessageKey(new ApiError(400, "validation_failed"))).toBe("errors.generic");
  });

  test("falls back to the generic text for an unknown code", () => {
    expect(errorMessageKey(new ApiError(500, null))).toBe("errors.generic");
  });

  test("treats a failed request without a response as a network error", () => {
    expect(errorMessageKey(new TypeError("Network request failed"))).toBe("errors.NETWORK");
  });
});
