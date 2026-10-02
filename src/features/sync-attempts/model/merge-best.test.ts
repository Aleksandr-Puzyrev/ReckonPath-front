import { attemptFixture } from "@shared/test-utils/attempt-fixture";

import { mergeBest } from "./merge-best";

const KNOWN = new Set(["c-1", "c-2", "c-20"]);

describe("mergeBest", () => {
  test("takes the better result of another device (ACC-08)", () => {
    const merged = mergeBest([{ id: "c-20", bestStars: 3, bestMoves: 6 }], [], KNOWN);

    expect(merged).toEqual({ "c-20": { stars: 3, moves: 6 } });
  });

  test("keeps a waiting attempt that beats the server", () => {
    const pending = [
      attemptFixture({ ref: "c-2", claimed: { result: "won", movesUsed: 4, stars: 3 } }),
    ];

    const merged = mergeBest([{ id: "c-2", bestStars: 1, bestMoves: 9 }], pending, KNOWN);

    expect(merged["c-2"]).toEqual({ stars: 3, moves: 4 });
  });

  test("follows the server when it corrected a sent attempt down (LVL-27)", () => {
    const merged = mergeBest([{ id: "c-1", bestStars: 1, bestMoves: 9 }], [], KNOWN);

    expect(merged["c-1"]).toEqual({ stars: 1, moves: 9 });
  });

  test("ignores waiting losses and levels the app does not have", () => {
    const pending = [
      attemptFixture({ ref: "c-2", claimed: { result: "lost", movesUsed: 4, stars: null } }),
    ];

    const merged = mergeBest([{ id: "c-99", bestStars: 3, bestMoves: 5 }], pending, KNOWN);

    expect(merged).toEqual({});
  });
});
