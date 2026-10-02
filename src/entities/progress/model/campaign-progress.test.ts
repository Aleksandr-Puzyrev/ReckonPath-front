import {
  campaignMaxStars,
  campaignStars,
  currentLevelId,
  isWorldPerfect,
  isWorldUnlocked,
  levelStateOf,
} from "./campaign-progress";

const world = (...ids: string[]) => ({ levels: ids.map((id) => ({ level: { id } })) });
const WORLDS = [world("c-1", "c-2"), world("c-3", "c-4"), world()];

describe("campaign progress", () => {
  test("starts at the first level when nothing is won", () => {
    expect(currentLevelId(WORLDS, {})).toBe("c-1");
    expect(levelStateOf("c-2", "c-1", {})).toBe("locked");
  });

  test("opens the next level after any win (Part 1 §3.2)", () => {
    const best = { "c-1": { stars: 1 as const, moves: 9 } };
    expect(currentLevelId(WORLDS, best)).toBe("c-2");
    expect(levelStateOf("c-1", "c-2", best)).toBe("done");
    expect(levelStateOf("c-2", "c-2", best)).toBe("current");
  });

  test("opens the next world after its last level is won (LVL-24)", () => {
    const partial = { "c-1": { stars: 3 as const, moves: 2 } };
    expect(isWorldUnlocked(WORLDS[1] ?? world(), currentLevelId(WORLDS, partial), partial)).toBe(
      false,
    );

    const done = { ...partial, "c-2": { stars: 2 as const, moves: 4 } };
    expect(isWorldUnlocked(WORLDS[1] ?? world(), currentLevelId(WORLDS, done), done)).toBe(true);
  });

  test("keeps a world without levels locked", () => {
    expect(isWorldUnlocked(world(), null, {})).toBe(false);
  });

  test("has no current level when everything is won", () => {
    const best = Object.fromEntries(
      ["c-1", "c-2", "c-3", "c-4"].map((id) => [id, { stars: 3 as const, moves: 1 }]),
    );
    expect(currentLevelId(WORLDS, best)).toBeNull();
  });

  test("sums the best stars against three per level", () => {
    const best = { "c-1": { stars: 3 as const, moves: 2 }, "c-2": { stars: 2 as const, moves: 4 } };
    expect(campaignStars(WORLDS, best)).toBe(5);
    expect(campaignMaxStars(WORLDS)).toBe(12);
  });

  test("marks a world perfect only with three stars everywhere", () => {
    const two = { "c-1": { stars: 3 as const, moves: 2 }, "c-2": { stars: 2 as const, moves: 4 } };
    expect(isWorldPerfect(WORLDS[0] ?? world(), two)).toBe(false);
    const three = { ...two, "c-2": { stars: 3 as const, moves: 3 } };
    expect(isWorldPerfect(WORLDS[0] ?? world(), three)).toBe(true);
    expect(isWorldPerfect(world(), {})).toBe(false);
  });
});
