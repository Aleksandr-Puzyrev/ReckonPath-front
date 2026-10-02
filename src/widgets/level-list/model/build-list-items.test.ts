import type { CampaignWorld, WorldNumber } from "@entities/level";

import { buildListItems, currentItemIndex } from "./build-list-items";

const level = (number: number, world: WorldNumber) => ({
  level: {
    v: 2 as const,
    id: `c-${number}`,
    rows: 4,
    cols: 4,
    targets: [[3, 3]] as [number, number][],
    probeMode: "distance" as const,
  },
  number,
  world,
});

const WORLDS: CampaignWorld[] = [
  { number: 1, firstLevel: 1, lastLevel: 2, levels: [level(1, 1), level(2, 1)] },
  { number: 2, firstLevel: 3, lastLevel: 4, levels: [level(3, 2), level(4, 2)] },
];

describe("buildListItems", () => {
  test("shows the open world with its levels and collapses the locked one", () => {
    const items = buildListItems(WORLDS, { "c-1": { stars: 3, moves: 2 } });
    expect(items.map(({ type, key }) => `${type}:${key}`)).toEqual([
      "world:world-1",
      "level:c-1",
      "level:c-2",
      "world:world-2",
    ]);
    expect(items[0]).toMatchObject({ isUnlocked: true, stars: 3, maxStars: 6 });
    expect(items[3]).toMatchObject({ isUnlocked: false });
  });

  test("marks done, current, and locked levels", () => {
    const items = buildListItems(WORLDS, {});
    expect(items.flatMap((item) => (item.type === "level" ? [item.state] : []))).toEqual([
      "current",
      "locked",
    ]);
    expect(currentItemIndex(items)).toBe(1);
  });

  test("opens the next world once the last level of the previous one is won", () => {
    const items = buildListItems(WORLDS, {
      "c-1": { stars: 3, moves: 2 },
      "c-2": { stars: 3, moves: 3 },
    });
    expect(items[3]).toMatchObject({ type: "world", isUnlocked: true, isPerfect: false });
    expect(items[0]).toMatchObject({ isPerfect: true });
    expect(currentItemIndex(items)).toBe(4);
  });

  test("has no current row when everything is won", () => {
    const best = Object.fromEntries(
      [1, 2, 3, 4].map((number) => [`c-${number}`, { stars: 1 as const, moves: 9 }]),
    );
    expect(currentItemIndex(buildListItems(WORLDS, best))).toBeNull();
  });
});
