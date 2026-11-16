import { mockOverview, mockServer, passMockLevels } from "@shared/test-utils/api-mock";

import { buildListItems, currentItemIndex } from "./build-list-items";

const worldsAfter = (count: number, stars?: number) => {
  passMockLevels(count, stars);
  return mockOverview("ru").worlds;
};

const keysOf = (items: ReturnType<typeof buildListItems>) =>
  items.map(({ type, key }) => `${type}:${key}`);

describe("buildListItems", () => {
  afterEach(() => mockServer.reset());

  test("shows the open world with its levels and collapses the locked ones", () => {
    const items = buildListItems(worldsAfter(1));
    const worldOne = items.filter((item) => item.type === "level");

    expect(keysOf(items)[0]).toBe("world:world-1");
    expect(worldOne.length).toBeGreaterThan(1);
    expect(items.filter((item) => item.type === "world" && !item.isUnlocked).length).toBe(
      items.filter((item) => item.type === "world").length - 1,
    );
  });

  test("marks done, current and locked levels by the server's states", () => {
    const items = buildListItems(worldsAfter(1));
    const states = items.flatMap((item) => (item.type === "level" ? [item.state] : []));

    expect(states.slice(0, 3)).toEqual(["done", "current", "locked"]);
    expect(currentItemIndex(items)).toBe(2);
  });

  test("shows a 3★ level as done and its world as perfect", () => {
    const worlds = worldsAfter(1);
    const firstWorldSize = worlds[0]?.levels.length ?? 0;
    const items = buildListItems(worldsAfter(firstWorldSize, 3));

    expect(items[0]).toMatchObject({ type: "world", isPerfect: true });
    expect(items[firstWorldSize + 1]).toMatchObject({ type: "world", isUnlocked: true });
  });

  test("has no current row when everything is won", () => {
    expect(currentItemIndex(buildListItems(worldsAfter(1000)))).toBeNull();
  });
});
