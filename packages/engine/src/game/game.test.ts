import * as fc from "fast-check";

import { createBoard } from "../level/create-board";
import type { GameState } from "../model/types";
import { makeLevel } from "../test-utils/make-level";

import { applyTap, canContinue, continueGame, initGame, isStale, moveLimitOf, stars } from "./game";

const makeGame = (overrides: Record<string, unknown> = {}) => {
  const level = makeLevel({
    bombs: [[0, 4]],
    buoys: [[2, 0]],
    moveLimit: 6,
    stars: [3, 4],
    ...overrides,
  });
  const { board, rules } = createBoard(level);
  return initGame(board, rules);
};

const snapshotOf = (state: GameState) => ({
  revealed: [...state.revealed.entries()],
  found: [...state.found],
  bombsHit: [...state.bombsHit],
  movesUsed: state.movesUsed,
  bonusMoves: state.bonusMoves,
  status: state.status,
  epoch: state.epoch,
  lastValue: state.lastValue,
});

const tapSequence = fc.array(fc.integer({ min: 0, max: 24 }), { maxLength: 30 });

const playAll = (state: GameState, taps: number[]) =>
  taps.reduce((current, idx) => applyTap(current, idx).state, state);

describe("applyTap", () => {
  test("never mutates the input state", () => {
    fc.assert(
      fc.property(tapSequence, (taps) => {
        let state = makeGame();
        taps.forEach((idx) => {
          const before = snapshotOf(state);
          const { state: next } = applyTap(state, idx);
          expect(snapshotOf(state)).toEqual(before);
          state = next;
        });
      }),
    );
  });

  test("gives identical results for identical taps", () => {
    fc.assert(
      fc.property(tapSequence, (taps) => {
        expect(snapshotOf(playAll(makeGame(), taps))).toEqual(
          snapshotOf(playAll(makeGame(), taps)),
        );
      }),
    );
  });

  test("never decreases the moves used", () => {
    fc.assert(
      fc.property(tapSequence, (taps) => {
        let state = makeGame();
        taps.forEach((idx) => {
          const { state: next } = applyTap(state, idx);
          expect(next.movesUsed).toBeGreaterThanOrEqual(state.movesUsed);
          state = next;
        });
      }),
    );
  });

  test("never lets the moves used exceed the move limit", () => {
    fc.assert(
      fc.property(tapSequence, (taps) => {
        let state = makeGame();
        taps.forEach((idx) => {
          state = applyTap(state, idx).state;
          const limit = moveLimitOf(state);
          if (limit !== null) expect(state.movesUsed).toBeLessThanOrEqual(limit);
        });
      }),
    );
  });

  test.each([25, -1, 1.5])("throws for the cell index %s outside the board", (idx) => {
    expect(() => applyTap(makeGame(), idx)).toThrow(RangeError);
  });

  test("keeps a level without a move limit playing", () => {
    const state = playAll(makeGame({ moveLimit: null, stars: null }), [0, 1, 2, 3, 5, 6, 7, 8, 9]);
    expect(state.status).toBe("playing");
    expect(moveLimitOf(state)).toBeNull();
  });
});

describe("continueGame", () => {
  test("throws while the game is still playing", () => {
    expect(() => continueGame(makeGame())).toThrow("The game cannot be continued");
  });

  test("allows continuing a game lost on the move limit", () => {
    expect(canContinue(playAll(makeGame({ moveLimit: 1 }), [0]))).toBe(true);
  });

  test("uses the configured bonus", () => {
    const lost = playAll(makeGame({ moveLimit: 1 }), [0]);
    expect(continueGame(lost, 5).bonusMoves).toBe(5);
  });
});

describe("stars", () => {
  test("is null when the level has no thresholds", () => {
    expect(stars(makeGame({ stars: null }))).toBeNull();
  });
});

describe("isStale", () => {
  test("marks answers from an earlier epoch as stale", () => {
    const game = makeGame({
      targets: [
        [4, 4],
        [0, 0],
      ],
    });
    const afterReveal = applyTap(game, 12).state;
    const afterFind = applyTap(afterReveal, 0).state;
    const reveal = afterFind.revealed.get(12);
    if (reveal === undefined) throw new Error("Cell 12 should be revealed");

    expect(isStale(afterReveal, reveal)).toBe(false);
    expect(isStale(afterFind, reveal)).toBe(true);
  });

  test("never marks a bomb or a target as stale", () => {
    const state = makeGame();
    expect(isStale(state, { kind: "bomb" })).toBe(false);
    expect(isStale(state, { kind: "target", bombNear: false })).toBe(false);
  });
});
