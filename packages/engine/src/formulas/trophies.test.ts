import { roundHalfAwayFromZero, trophyDelta } from "./trophies";

describe("roundHalfAwayFromZero", () => {
  test.each([
    [0.5, 1],
    [-0.5, -1],
    [1.49, 1],
    [-1.5, -2],
    [-0.02, 0],
    [2, 2],
  ])("rounds %d to %d", (value, expected) => {
    expect(roundHalfAwayFromZero(value)).toBe(expected);
  });

  test("never returns negative zero", () => {
    expect(Object.is(roundHalfAwayFromZero(-0.2), 0)).toBe(true);
  });
});

describe("trophyDelta", () => {
  test("uses custom remote-config rating constants", () => {
    const config = { base: 20, divisor: 10, min: 5, max: 40, bronzeLossCap: 10 };
    expect(
      trophyDelta(
        { myTrophies: 3000, opponentTrophies: 3100, outcome: "win", kind: "ranked" },
        config,
      ),
    ).toBe(30);
  });

  test("does not cap losses outside Bronze", () => {
    expect(
      trophyDelta({ myTrophies: 3000, opponentTrophies: 2500, outcome: "loss", kind: "ranked" }),
    ).toBe(-50);
  });
});
