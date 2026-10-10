import type { Bundle, ShopItem } from "./item-type";
import { offerViewOf } from "./shop-offer";

const ITEM: ShopItem = {
  id: "reef",
  type: "FIELD",
  slot: "field",
  rarity: "rare",
  name: "Coral reef",
  description: "",
  preview: "",
  package: { url: "", sha256: "", version: 1 },
  price: { emeralds: 480 },
  availableTo: null,
  stockLeft: null,
  owned: false,
  equipped: false,
  visibleInMatch: true,
};

const BUNDLE: Bundle = {
  id: "set",
  name: "Set",
  description: "",
  rarity: "legendary",
  preview: "",
  items: ["a"],
  basePrice: { emeralds: 900 },
  price: { emeralds: 560 },
  ownedItems: [],
  availableTo: "2026-10-16T12:00:00Z",
};

describe("offerViewOf", () => {
  test("shows the price of an item not owned", () => {
    expect(offerViewOf({ kind: "item", item: ITEM })).toMatchObject({ mark: null, slot: "field" });
  });

  test("marks an equipped item over an owned one", () => {
    const item = { ...ITEM, owned: true, equipped: true };

    expect(offerViewOf({ kind: "item", item }).mark).toBe("equipped");
  });

  test("marks an owned item", () => {
    expect(offerViewOf({ kind: "item", item: { ...ITEM, owned: true } }).mark).toBe("owned");
  });

  test("describes a bundle, complete or not", () => {
    expect(offerViewOf({ kind: "bundle", bundle: BUNDLE, isComplete: true })).toMatchObject({
      slot: "bundle",
      mark: "complete",
      isVisibleInMatch: false,
      availableTo: "2026-10-16T12:00:00Z",
    });
  });
});
