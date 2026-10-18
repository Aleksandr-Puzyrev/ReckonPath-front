import { formatTrophyDelta } from "./format-trophy-delta";

describe("formatTrophyDelta", () => {
  test("signs a gain and a loss with a typographic minus", () => {
    expect(formatTrophyDelta(32)).toBe("+32");
    expect(formatTrophyDelta(-18)).toBe("−18");
  });

  test("shows no sign for zero", () => {
    expect(formatTrophyDelta(0)).toBe("0");
  });
});
