import { ApiError } from "@shared/api";

import { freshGameOf, gameInError } from "./fresh-game-of";

const GAME = { id: "game-1", seq: 3, cells: [], board: { rows: 4 } };

describe("freshGameOf", () => {
  test("takes the current game from a stale_game answer", () => {
    expect(freshGameOf(new ApiError(409, "stale_game", GAME))).toBe(GAME);
  });

  test("ignores other errors and a stale_game without a game", () => {
    expect(freshGameOf(new ApiError(409, "cell_open", GAME))).toBeNull();
    expect(freshGameOf(new ApiError(409, "stale_game", {}))).toBeNull();
    expect(freshGameOf(new TypeError("Network request failed"))).toBeNull();
  });
});

describe("gameInError", () => {
  test("takes the game from an error with the given code", () => {
    expect(gameInError(new ApiError(409, "daily_done", GAME), "daily_done")).toBe(GAME);
    expect(gameInError(new ApiError(409, "stale_game", GAME), "daily_done")).toBeNull();
  });
});
