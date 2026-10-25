import { toCamelKeys } from "./to-camel-keys";
import { toSnakeKeys } from "./to-snake-keys";

describe("toCamelKeys", () => {
  test("renames snake_case keys deep inside objects and arrays", () => {
    expect(
      toCamelKeys({ access_token: "a", user: { is_guest: true }, levels: [{ best_moves: 3 }] }),
    ).toEqual({ accessToken: "a", user: { isGuest: true }, levels: [{ bestMoves: 3 }] });
  });

  test("keeps data keys and values untouched", () => {
    const value = { "c-27": 3, "arena.max_turns": 40, reason: "level_first_win", x: null };

    expect(toCamelKeys(value)).toEqual(value);
  });

  test("returns the snake_case form back after toSnakeKeys", () => {
    const value = { refreshToken: "r", level2Stars: [1, 2], wallet: { emeralds: 5 } };

    expect(toCamelKeys(toSnakeKeys(value))).toEqual(value);
  });
});
