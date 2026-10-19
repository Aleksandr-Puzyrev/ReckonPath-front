import { creditXp, mockPlayerLevel, resetMockPlayer } from "./mock-player";

describe("mockPlayerLevel", () => {
  afterEach(resetMockPlayer);

  test("starts at level 1", () => {
    expect(mockPlayerLevel()).toEqual({ level: 1, xp: 0, xpToNext: 50 });
  });

  test("moves to the next level when the experience fills it", () => {
    creditXp(60);

    expect(mockPlayerLevel()).toEqual({ level: 2, xp: 10, xpToNext: 75 });
  });
});
