import { tutorialHintKey, tutorialMapOf, tutorialRefusalKey } from "./editor-tutorial";

describe("tutorialRefusalKey", () => {
  test("explains rocks, a shared cell and the limits in tutorial words (design 30.2)", () => {
    expect(tutorialRefusalKey({ kind: "targetOnRock" }, "target")).toBe("map.tutorial.rock");
    expect(tutorialRefusalKey({ kind: "bombOnRock" }, "bomb")).toBe("map.tutorial.rock");
    expect(tutorialRefusalKey({ kind: "bombAndTarget" }, "bomb")).toBe("map.tutorial.shared");
    expect(tutorialRefusalKey({ kind: "limit", max: 1 }, "target")).toBe(
      "map.tutorial.targetLimit",
    );
    expect(tutorialRefusalKey({ kind: "limit", max: 1 }, "bomb")).toBe("map.tutorial.bombLimit");
  });

  test("leaves other refusals to the usual texts", () => {
    expect(tutorialRefusalKey({ kind: "bridgeOffStream" }, "bridge")).toBeNull();
  });
});

describe("tutorialHintKey", () => {
  test("asks for targets first, then for the bomb, then nothing", () => {
    expect(tutorialHintKey({ targets: 0, bombs: 0 }, 1)).toBe("map.tutorial.target");
    expect(tutorialHintKey({ targets: 1, bombs: 0 }, 1)).toBe("map.tutorial.bomb");
    expect(tutorialHintKey({ targets: 1, bombs: 1 }, 1)).toBeNull();
  });
});

describe("tutorialMapOf", () => {
  const FORMAT = {
    rows: 6,
    cols: 7,
    targets: 1,
    moveSeconds: 10,
    league: "bronze",
    leagueTitle: "Bronze",
    caps: { stream: 4, bridge: 0, heavy: 0, rock: 1, bombs: 1, fences: 0 },
  };

  test("draws the template in the league's size with only the allowed elements", () => {
    expect(tutorialMapOf(FORMAT)).toEqual(
      expect.objectContaining({
        rows: 6,
        cols: 7,
        bridges: [],
        rocks: [[5, 0]],
        fences: [],
      }),
    );
    expect(tutorialMapOf(FORMAT).streams).toHaveLength(3);
  });
});
