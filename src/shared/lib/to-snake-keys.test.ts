import { toSnakeKeys } from "./to-snake-keys";

describe("toSnakeKeys", () => {
  test("renames camelCase keys deep inside objects and arrays", () => {
    expect(toSnakeKeys({ refreshToken: "r", taps: [[1, 2]], claimed: { movesUsed: 4 } })).toEqual({
      refresh_token: "r",
      taps: [[1, 2]],
      claimed: { moves_used: 4 },
    });
  });

  test("keeps data keys untouched", () => {
    const value = { "arena.maxTurns": 40, "c-27": 1, emeralds: 2 };

    expect(toSnakeKeys(value)).toEqual(value);
  });
});
