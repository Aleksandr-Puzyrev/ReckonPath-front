import type { Stars } from "@reckon-path/engine";

import { CAMPAIGN_LEVELS } from "@entities/level";

import { currentGameOf } from "./current-game";

const NO_ATTEMPT = { levelId: null, actions: [] };

const passed = (count: number, stars: Stars = 3) =>
  Object.fromEntries(
    CAMPAIGN_LEVELS.slice(0, count).map(({ level }) => [level.id, { stars, moves: 5 }]),
  );

describe("currentGameOf", () => {
  test("offers the first level that is not passed yet (Part 4 §3.1)", () => {
    const current = currentGameOf(passed(3), NO_ATTEMPT);

    expect(current).toMatchObject({ kind: "level", campaignLevel: { number: 4 }, game: null });
  });

  test("replays the saved attempt of the current level (design 19.2)", () => {
    const level = CAMPAIGN_LEVELS[0]?.level;
    const current = currentGameOf(
      {},
      { levelId: level?.id ?? "", actions: [{ type: "tap", cell: 0 }] },
    );

    expect(current.kind === "level" ? current.game?.movesUsed : null).toBe(1);
  });

  test("ignores a saved attempt of another level", () => {
    const current = currentGameOf({}, { levelId: "other", actions: [{ type: "tap", cell: 0 }] });

    expect(current).toMatchObject({ kind: "level", game: null });
  });

  test("tells the campaign is complete with the levels below 3★ (decision 0041 #5)", () => {
    const best = { ...passed(CAMPAIGN_LEVELS.length), ...passed(2, 2) };

    const current = currentGameOf(best, NO_ATTEMPT);

    expect(current).toMatchObject({ kind: "done", total: CAMPAIGN_LEVELS.length });
    expect(current.kind === "done" ? current.belowThree.map(({ number }) => number) : []).toEqual([
      1, 2,
    ]);
  });
});
