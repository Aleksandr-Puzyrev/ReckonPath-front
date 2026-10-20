import { tutorialHintKey, tutorialRefusalKey } from "./editor-tutorial";

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
