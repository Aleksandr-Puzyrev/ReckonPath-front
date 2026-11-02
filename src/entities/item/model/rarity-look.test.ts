import { rarityLookOf } from "./rarity-look";

describe("rarityLookOf", () => {
  test("draws an exclusive item as legendary (decision 0054 #2)", () => {
    expect(rarityLookOf("exclusive")).toBe("legendary");
  });

  test("keeps the other rarities", () => {
    expect(rarityLookOf("rare")).toBe("rare");
  });
});
