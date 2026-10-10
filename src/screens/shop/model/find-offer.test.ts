import type { Shop, ShopItem } from "@entities/item";

import { featuredKeyOf, findOffer } from "./find-offer";

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

const SHOP: Shop = {
  featured: null,
  tabs: [{ id: "fields", items: [ITEM] }],
  bundles: [
    {
      id: "set",
      name: "Set",
      description: "",
      rarity: "rare",
      preview: "",
      items: ["a"],
      basePrice: { emeralds: 900 },
      price: { emeralds: 560 },
      ownedItems: ["a"],
      availableTo: null,
    },
  ],
  cacheTtlSec: 300,
};

describe("findOffer", () => {
  test("finds an item in any tab", () => {
    expect(findOffer(SHOP, "reef")).toEqual({ kind: "item", item: ITEM });
  });

  test("finds a bundle and tells whether it is complete", () => {
    expect(findOffer(SHOP, "set")).toMatchObject({ kind: "bundle", isComplete: true });
  });

  test("returns null for an offer that left the shop", () => {
    expect(findOffer(SHOP, "gone")).toBeNull();
  });
});

describe("featuredKeyOf", () => {
  test("points to the featured bundle or item", () => {
    const featured = {
      id: "drop",
      image: "",
      title: "",
      subtitle: "",
      endsAt: "2026-10-16T12:00:00Z",
    };
    expect(featuredKeyOf({ ...featured, target: { bundle: "set" } })).toBe("set");
    expect(featuredKeyOf({ ...featured, target: { item: "reef" } })).toBe("reef");
  });
});
