import { ApiError } from "@shared/api";

import { banOf, banOfDetails } from "./ban";

describe("banOf", () => {
  test("reads the scope, the end and the reason of a BANNED error (Part 7 §2)", () => {
    const error = new ApiError(403, "BANNED", {
      scope: "arena",
      until: "2026-10-12T00:00:00Z",
      reason: "Boosting",
    });

    expect(banOf(error)).toEqual({
      scope: "arena",
      until: "2026-10-12T00:00:00Z",
      reason: "Boosting",
    });
  });

  test("treats a ban without details as a permanent full ban", () => {
    expect(banOfDetails(undefined)).toEqual({ scope: "all", until: null, reason: "" });
  });

  test("ignores other errors", () => {
    expect(banOf(new ApiError(403, "FORBIDDEN"))).toBeNull();
    expect(banOf(new Error("network"))).toBeNull();
  });
});
