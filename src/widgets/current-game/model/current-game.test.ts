import {
  MOCK_CAMPAIGN_LEVELS,
  mockOverview,
  mockServer,
  passMockLevels,
} from "@shared/test-utils/api-mock";

import { currentGameOf } from "./current-game";

const overviewAfter = (count: number) => {
  passMockLevels(count);
  return mockOverview("ru");
};

describe("currentGameOf", () => {
  afterEach(() => mockServer.reset());

  test("offers the server's current level (Part 4 §3.1)", () => {
    expect(currentGameOf(overviewAfter(3))).toMatchObject({
      kind: "level",
      level: { number: 4 },
      world: { number: 1 },
      active: null,
    });
  });

  test("shows the unfinished game of the current level (design 19.2)", () => {
    const overview = {
      ...overviewAfter(3),
      active: { gameId: "game-1", level: 4, found: 1, total: 2 },
    };

    expect(currentGameOf(overview)).toMatchObject({ active: { found: 1, total: 2 } });
  });

  test("ignores an unfinished game of another level", () => {
    const overview = {
      ...overviewAfter(3),
      active: { gameId: "game-1", level: 2, found: 1, total: 2 },
    };

    expect(currentGameOf(overview)).toMatchObject({ kind: "level", active: null });
  });

  test("tells the campaign is complete with the levels below 3★ (decision 0041 #5)", () => {
    const passed = overviewAfter(MOCK_CAMPAIGN_LEVELS.length);
    const overview = {
      ...passed,
      worlds: passed.worlds.map((world) => ({
        ...world,
        levels: world.levels.map((level) => (level.number <= 2 ? { ...level, stars: 2 } : level)),
      })),
    };

    const current = currentGameOf(overview);

    expect(current).toMatchObject({ kind: "done", total: MOCK_CAMPAIGN_LEVELS.length });
    expect(current?.kind === "done" ? current.belowThree.map(({ number }) => number) : []).toEqual([
      1, 2,
    ]);
  });
});
